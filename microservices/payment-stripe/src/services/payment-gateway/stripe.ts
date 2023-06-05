import { Log } from '@lomray/microservice-helpers';
import { BaseException, Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import StripeSdk from 'stripe';
import remoteConfig from '@config/remote';
import BalanceType from '@constants/balance-type';
import StripeAccountTypes from '@constants/stripe-account-types';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionRole from '@constants/transaction-role';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import Transaction from '@entities/transaction';
import composeBalance from '@helpers/compose-balance';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import getPercentFromAmount from '@helpers/get-percent-from-amount';
import messages from '@helpers/validators/messages';
import TBalance from '@interfaces/balance';
import TCurrency from '@interfaces/currency';
import Abstract, { IPriceParams, IProductParams } from './abstract';

export interface IStripeProductParams extends IProductParams {
  name: string;
  description?: string;
  images?: string[];
}

interface IPaymentIntentParams {
  userId: string;
  receiverId: string;
  // Original cost of entity for which will be pay user
  entityCost: number;
  // Set who will be pay for provider and application fees
  feesPayer?: TransactionRole;
  cardId?: string;
  title?: string;
  applicationPaymentPercent?: number;
  entityId?: string;
  // Additional fee that should pay one of the transaction contributor
  additionalFeesPercent?: Record<TransactionRole, number>;
  // Extra receiver revenue percent from application payment percent
  extraReceiverRevenuePercent?: number;
}

interface IRefundParams {
  transactionId: string;
  /**
   * If user don't have required amount in connect account, he must provide
   * bank account or card id that will be used for refund charge
   */
  bankAccountId?: string;
  cardId?: string;
}

interface ICheckoutParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

interface ICheckoutEvent {
  id: string;
  currency: string;
  amount_total: number;
  customer: string;
  mode: string;
  payment_status: string;
  status: string;
}

interface ITransferInfo {
  amount: number;
  destinationUser: string;
  userId: string;
}

interface IPayoutMethod {
  id: string;
  method: 'card' | 'bankAccount';
}

interface IInstantPayoutParams {
  userId: string;
  amount: number;
  payoutMethod?: IPayoutMethod;
  currency?: TCurrency;
}

type TCustomerBalance = Record<BalanceType, TBalance>;

interface IGetPaymentIntentFeesParams
  extends Pick<
    IPaymentIntentParams,
    | 'applicationPaymentPercent'
    | 'feesPayer'
    | 'additionalFeesPercent'
    | 'extraReceiverRevenuePercent'
  > {
  entityUnitCost: number;
}

type TAvailablePaymentMethods =
  | StripeSdk.Card.AvailablePayoutMethod[]
  | StripeSdk.BankAccount.AvailablePayoutMethod[]
  | null;

/**
 * Stripe payment provider
 */
class Stripe extends Abstract {
  /**
   * Add new card
   */
  addCard(): Promise<Card> {
    return Promise.resolve(new Card());
  }

  /**
   * Add bank account
   */
  addBankAccount(): Promise<BankAccount> {
    return Promise.resolve(new BankAccount());
  }

  /**
   * Create SetupIntent and get back client secret
   */
  public async setupIntent(userId: string): Promise<string | null> {
    const { customerId } = await super.getCustomer(userId);

    const { client_secret: clientSecret } = await this.sdk.setupIntents.create({
      customer: customerId,
      // eslint-disable-next-line camelcase
      payment_method_types: this.methods,
    });

    return clientSecret;
  }

  /**
   * Create Customer entity
   */
  public async createCustomer(userId: string): Promise<Customer> {
    /**
     * @TODO: get users name, email and pass it into customer
     */
    const { id }: StripeSdk.Customer = await this.sdk.customers.create();

    return super.createCustomer(userId, id);
  }

  /**
   * Get unified transaction status
   */
  public getStatus(stripeStatus: StripeTransactionStatus): TransactionStatus {
    switch (stripeStatus) {
      case StripeTransactionStatus.SUCCEEDED:
      case StripeTransactionStatus.PAID:
        return TransactionStatus.SUCCESS;

      case StripeTransactionStatus.UNPAID:
      case StripeTransactionStatus.REQUIRES_CONFIRMATION:
        return TransactionStatus.REQUIRED_PAYMENT;

      case StripeTransactionStatus.ERROR:
      case StripeTransactionStatus.PAYMENT_FAILED:
        return TransactionStatus.ERROR;

      case StripeTransactionStatus.NO_PAYMENT_REQUIRED:
      case StripeTransactionStatus.PROCESSING:
        return TransactionStatus.IN_PROCESS;

      case StripeTransactionStatus.REFUND_SUCCEEDED:
        return TransactionStatus.REFUNDED;

      case StripeTransactionStatus.REFUND_PENDING:
        return TransactionStatus.REFUND_IN_PROCESS;

      case StripeTransactionStatus.REFUND_CANCELED:
        return TransactionStatus.REFUND_CANCELED;

      case StripeTransactionStatus.REFUND_FAILED:
        return TransactionStatus.REFUND_FAILED;
    }
  }

  /**
   * Create Product entity
   */
  public async createProduct(params: IStripeProductParams): Promise<Product> {
    const { entityId, name, description, images, userId } = params;

    const { id }: StripeSdk.Product = await this.sdk.products.create({
      name,
      description,
      images,
    });

    return super.createProduct(
      {
        entityId,
        userId,
      },
      id,
    );
  }

  /**
   * Create Price entity
   */
  public async createPrice(params: IPriceParams): Promise<Price> {
    const { currency, unitAmount, productId, userId } = params;

    const { id }: StripeSdk.Price = await this.sdk.prices.create({
      currency,
      product: productId,
      // eslint-disable-next-line camelcase
      unit_amount: unitAmount,
    });

    return super.createPrice(
      {
        userId,
        productId,
        currency,
        unitAmount,
      },
      id,
    );
  }

  /**
   * Create checkout session and return url to redirect user for payment
   */
  public async createCheckout(params: ICheckoutParams): Promise<string | null> {
    const { priceId, userId, successUrl, cancelUrl } = params;

    const { customerId } = await super.getCustomer(userId);
    const price = await this.priceRepository.findOne({ priceId }, { relations: ['product'] });

    if (!price) {
      Log.error(`There is no price related to this priceId: ${priceId}`);

      return null;
    }

    /* eslint-disable camelcase */
    const { id, url } = await this.sdk.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    /* eslint-enable camelcase */

    await this.createTransaction(
      {
        type: TransactionType.CREDIT,
        amount: price.unitAmount,
        userId,
        productId: price.productId,
        entityId: price.product.entityId,
        status: TransactionStatus.INITIAL,
      },
      id,
    );

    return url;
  }

  /**
   * Create ConnectAccount make redirect to account link and save stripeConnectAccount in customer
   */
  public async connectAccount(
    userId: string,
    email: string,
    accountType: StripeAccountTypes,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<string> {
    const customer = await super.getCustomer(userId);

    if (!customer.params.accountId) {
      const stripeConnectAccount: StripeSdk.Account = await this.sdk.accounts.create({
        type: accountType,
        country: 'US',
        email,
      });

      customer.params.accountId = stripeConnectAccount.id;
      customer.params.accountType = stripeConnectAccount.type as StripeAccountTypes;

      await this.customerRepository.save(customer);
    }

    return (await this.buildAccountLink(customer.params.accountId, refreshUrl, returnUrl)).url;
  }

  /**
   * Returns account link
   * NOTE: Use when user needs to update connect account data
   */
  public async getConnectAccountLink(
    userId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<string> {
    const customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have setup connect account",
      });
    }

    return (await this.buildAccountLink(customer.params.accountId, refreshUrl, returnUrl)).url;
  }

  /**
   * Get the webhook from stripe and handle deciding on type of event
   */
  public handleWebhookEvent(payload: string, signature: string, webhookKey: string): void {
    const event = this.sdk.webhooks.constructEvent(payload, signature, webhookKey);

    switch (event.type) {
      case 'checkout.session.completed':
        void this.handleTransactionCompleted(event);
        break;

      case 'account.updated':
        void this.handleAccountUpdated(event);
        break;

      case 'setup_intent.succeeded':
        void this.handleSetupIntentSucceed(event);
        break;

      case 'account.external_account.created':
        void this.handleExternalAccountCreate(event);
        break;

      case 'account.external_account.updated':
        void this.handleExternalAccountUpdated(event);
        break;

      case 'account.external_account.deleted':
        void this.handleExternalAccountDeleted(event);
        break;

      case 'payment_intent.processing':
      case 'payment_intent.payment_failed':
      case 'payment_intent.succeeded':
        void this.handlePaymentIntent(event);
        break;

      case 'charge.refund.updated':
      case 'charge.refunded':
        void this.handleChargeRefund(event);
        break;

      case 'payment_method.updated':
      case 'payment_method.automatically_updated':
        void this.handlePaymentMethodUpdated(event);
        break;

      case 'payment_method.detached':
        void this.handlePaymentMethodDetached(event);
        break;

      case 'customer.updated':
        void this.handleCustomerUpdated(event);
        break;
    }
  }

  /**
   * Handles payment method detach
   */
  public async handlePaymentMethodDetached(event: StripeSdk.Event): Promise<void> {
    const { id } = event.data.object as StripeSdk.PaymentMethod;

    const paymentMethod = await this.cardRepository
      .createQueryBuilder('card')
      .where("card.params->>'paymentMethodId' = :value", { value: id })
      .getOne();

    if (!paymentMethod) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Payment method'),
      });
    }

    await this.cardRepository.remove(paymentMethod);
  }

  /**
   * Handles customer update
   */
  public async handleCustomerUpdated(event: StripeSdk.Event): Promise<void> {
    const { id, invoice_settings: invoiceSettings } = event.data.object as StripeSdk.Customer;

    /**
     * @TODO: Investigate why relations return empty array
     */
    const customer = await this.customerRepository.findOne({ customerId: id });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    const cards = await this.cardRepository.find({
      userId: customer.userId,
    });

    const saveCardRequests = cards.map((card) => {
      card.isDefault = card.params.paymentMethodId === invoiceSettings.default_payment_method;

      return this.cardRepository.save(card);
    });

    await Promise.all(saveCardRequests);
  }

  /**
   * Handles payment method update
   * NOTE: Expected card that can be setup via setupIntent
   */
  public async handlePaymentMethodUpdated(event: StripeSdk.Event): Promise<void> {
    const { id, card: cardPaymentMethod } = event.data.object as StripeSdk.PaymentMethod;

    if (!cardPaymentMethod) {
      throw new BaseException({
        status: 500,
        message: "Payment method card wasn't provided",
      });
    }

    const card = await this.cardRepository
      .createQueryBuilder('card')
      .where("card.params->>'paymentMethodId' = :value", { value: id })
      .getOne();

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Payment method'),
      });
    }

    const {
      exp_month: expMonth,
      exp_year: expYear,
      last4: lastDigits,
      brand,
      funding,
    } = cardPaymentMethod;

    card.lastDigits = lastDigits;
    card.expired = toExpirationDate(expMonth, expYear);
    card.brand = brand;
    card.funding = funding;
  }

  /**
   * Handles refund statuses
   */
  public async handleChargeRefund(event: StripeSdk.Event): Promise<void> {
    const { status, payment_intent: paymentIntent } = event.data.object as StripeSdk.Refund;

    if (!paymentIntent || !status) {
      throw new BaseException({
        status: 500,
        message: "Payment intent id or refund status wasn't provided",
      });
    }

    const transactions = await this.transactionRepository.find({
      transactionId: this.extractId(paymentIntent),
    });

    if (!transactions.length) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Debit or credit transaction'),
      });
    }

    const saveRequests = transactions.map((transaction) => {
      transaction.status = this.getStatus(`refund_${status}` as unknown as StripeTransactionStatus);

      return this.transactionRepository.save(transaction);
    });

    await Promise.all(saveRequests);
  }

  /**
   * Handles payment intent statuses
   */
  public async handlePaymentIntent(event: StripeSdk.Event): Promise<void> {
    const { id, status, ...rest } = event.data.object as StripeSdk.PaymentIntent;

    const transactions = await this.transactionRepository.find({ transactionId: id });

    if (!transactions.length) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Debit or credit transaction'),
      });
    }

    const saveRequests = transactions.map((transaction) => {
      if (status === StripeTransactionStatus.SUCCEEDED) {
        /**
         * @TODO: charges property MUST exist is paymentIntent, check stripe sdk version
         */
        transaction.params.transferId = this.extractTransferIdFromPaymentIntent(
          // @ts-ignore
          rest?.charges?.data as StripeSdk.Charge[],
        );
      }

      transaction.status = this.getStatus(status as unknown as StripeTransactionStatus);

      return this.transactionRepository.save(transaction);
    });

    await Promise.all(saveRequests);
  }

  /**
   * Create instant payout
   * NOTE: Should be called from the API
   */
  public async instantPayout({
    userId,
    amount,
    payoutMethod,
    currency = 'usd',
  }: IInstantPayoutParams): Promise<boolean> {
    const unitAmount = this.toSmallestCurrencyUnit(amount);

    /**
     * Get related customer
     */
    const customer = await this.customerRepository.findOne({
      userId,
    });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have related connect account",
      });
    }

    if (!customer.params.isPayoutEnabled) {
      throw new BaseException({
        status: 400,
        message: "Payout isn't available",
      });
    }

    const { instant_available: instantBalance } = await this.sdk.balance.retrieve({
      stripeAccount: customer.params.accountId,
    });

    if (!instantBalance) {
      throw new BaseException({
        status: 500,
        message: "Instant balance isn't available",
      });
    }

    const balance = composeBalance(instantBalance);

    if (!balance?.[currency]) {
      throw new BaseException({
        status: 400,
        message: `Balance with the ${currency} isn't available`,
      });
    }

    if (balance?.[currency] < unitAmount) {
      throw new BaseException({
        status: 400,
        message: `Insufficient funds. Instant balance is ${balance?.[currency]} in ${currency}`,
      });
    }

    const payoutMethodData = await this.getPayoutMethodData(payoutMethod);

    if (!payoutMethodData?.isInstantPayoutAllow) {
      throw new BaseException({
        status: 400,
        message: "Provided payout method isn't support instant payout",
      });
    }

    await this.sdk.payouts.create(
      {
        currency,
        amount: unitAmount,
        method: 'instant',
        ...(payoutMethodData ? { destination: payoutMethodData.id } : {}),
      },
      { stripeAccount: customer.params.accountId },
    );

    return true;
  }

  /**
   * Returns user related connect account balance
   */
  public async getBalance(userId: string): Promise<TCustomerBalance> {
    const customer = await this.customerRepository.findOne({
      userId,
    });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have related connect account",
      });
    }

    const {
      available,
      pending,
      instant_available: instant = [],
    } = await this.sdk.balance.retrieve({
      stripeAccount: customer.params.accountId,
    });

    return {
      available: composeBalance(available),
      instant: composeBalance(instant),
      pending: composeBalance(pending),
    };
  }

  /**
   * Handles setup intent succeed
   * NOTE: Should be called when webhook triggers
   */
  public async handleSetupIntentSucceed(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const { payment_method } = event.data.object as StripeSdk.SetupIntent;

    if (!payment_method) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('The SetupIntent payment method'),
      });
    }

    /**
     * Get payment method data
     */
    const paymentMethod = await this.sdk.paymentMethods.retrieve(this.extractId(payment_method), {
      expand: [StripePaymentMethods.CARD],
    });

    if (!paymentMethod?.card || !paymentMethod?.customer) {
      throw new BaseException({
        status: 500,
        message: 'The payment method card or customer data is invalid.',
      });
    }

    const customer = await this.customerRepository.findOne({
      customerId: this.extractId(paymentMethod.customer),
    });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    const {
      id: paymentMethodId,
      card: { brand, last4: lastDigits, exp_month: expMonth, exp_year: expYear, funding },
    } = paymentMethod;

    const { userId, customerId } = customer;

    /**
     * Get attached cards count
     */
    const attachedCardsCount = await this.cardRepository.count({ userId });

    await this.cardRepository.save({
      lastDigits,
      brand,
      userId,
      funding,
      expired: toExpirationDate(expMonth, expYear),
      params: { isApproved: true, paymentMethodId },
    });

    /**
     * Handle if it's first customer payment method
     */
    if (attachedCardsCount !== 0) {
      return;
    }

    await this.setDefaultPaymentMethod(customerId, paymentMethodId);
  }

  /**
   * Handles connect account update
   * NOTE: Should be called when webhook triggers
   */
  public async handleExternalAccountUpdated(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const card = await this.getCardById(externalAccount.id);

      const {
        last4: lastDigits,
        brand,
        exp_year,
        exp_month,
        default_for_currency: isDefault,
        available_payout_methods: availablePayoutMethods,
        funding,
      } = externalAccount;

      card.isDefault = Boolean(isDefault);
      card.lastDigits = lastDigits;
      card.expired = toExpirationDate(exp_month, exp_year);
      card.brand = brand;
      card.funding = funding;
      card.isInstantPayoutAllowed = this.isAllowedInstantPayout(availablePayoutMethods);

      await this.cardRepository.save(card);

      return;
    }

    const bankAccount = await this.getBankAccountById(externalAccount.id);

    const {
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    bankAccount.isDefault = Boolean(isDefault);
    bankAccount.lastDigits = lastDigits;
    bankAccount.holderName = holderName;
    bankAccount.bankName = bankName;
    bankAccount.isInstantPayoutAllowed = this.isAllowedInstantPayout(availablePayoutMethods);

    await this.bankAccountRepository.save(bankAccount);
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account create
   * NOTE: Should be called when webhook triggers
   */
  public async handleExternalAccountCreate(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'The connected account reference in external account data',
        ),
      });
    }

    const { userId } = await this.getCustomerByAccountId(this.extractId(externalAccount.account));

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const {
        id: cardId,
        last4: lastDigits,
        brand,
        funding,
        exp_year,
        exp_month,
        available_payout_methods: availablePayoutMethods,
        default_for_currency: isDefault,
      } = externalAccount;

      await this.cardRepository.save({
        lastDigits,
        brand,
        funding,
        userId,
        isInstantPayoutAllowed: this.isAllowedInstantPayout(availablePayoutMethods),
        isDefault: Boolean(isDefault),
        expired: toExpirationDate(exp_month, exp_year),
        params: { cardId },
      });

      return;
    }

    const {
      id: bankAccountId,
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    await this.bankAccountRepository.save({
      isDefault: Boolean(isDefault),
      bankAccountId,
      lastDigits,
      userId,
      isInstantPayoutAllowed: this.isAllowedInstantPayout(availablePayoutMethods),
      holderName,
      bankName,
      params: { bankAccountId },
    });
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account deleted
   * NOTE: Should be called when webhook triggers
   */
  public async handleExternalAccountDeleted(event: StripeSdk.Event): Promise<void> {
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: 'The connected account reference in external account data not found.',
      });
    }

    const externalAccountId = this.extractId(externalAccount.account);

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const card = await this.getCardById(externalAccountId);

      await this.cardRepository.remove(card);

      return;
    }

    const bankAccount = await this.getBankAccountById(externalAccountId);

    await this.bankAccountRepository.remove(bankAccount);
  }

  /**
   * Handles customer update
   */
  public async handleAccountUpdated(event: StripeSdk.Event) {
    /* eslint-disable camelcase */
    const {
      id,
      payouts_enabled: isPayoutEnabled,
      charges_enabled: isChargesEnabled,
      capabilities,
    } = event.data.object as StripeSdk.Account;

    const customer = await this.getCustomerByAccountId(id);

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    /**
     * Check if customer can accept payment
     * NOTE: Check if user correctly and verify setup connect account
     */
    customer.params.isPayoutEnabled = isPayoutEnabled;
    customer.params.transferCapabilityStatus = capabilities?.transfers || 'inactive';
    customer.params.isVerified = isChargesEnabled && capabilities?.transfers === 'active';

    await this.customerRepository.save(customer);
    /* eslint-enable camelcase */
  }

  /**
   * Handles completing of transaction inside stripe payment process
   */
  public async handleTransactionCompleted(event: StripeSdk.Event): Promise<Transaction | void> {
    const { id, payment_status: paymentStatus, status } = event.data.object as ICheckoutEvent;

    const transaction = await this.transactionRepository.findOne({ transactionId: id });

    if (!transaction) {
      Log.error(`There is no actual transfer for entity with following  transaction id: ${id}`);
    }

    await this.transactionRepository.update(
      { transactionId: id },
      {
        status: this.getStatus(paymentStatus as StripeTransactionStatus),
        params: {
          checkoutStatus: status as StripeCheckoutStatus,
          paymentStatus: paymentStatus as StripeTransactionStatus,
        },
      },
    );

    void Microservice.eventPublish(Event.EntityPaid, {
      entityId: transaction?.entityId,
      userId: transaction?.userId,
    });
  }

  /**
   * Create transfer for connected account
   */
  public async createTransfer(entityId: string, userId: string, payoutCoeff: number) {
    const transfer = await this.getTransferInfo(entityId, userId);
    const product = await this.productRepository.findOne({ entityId });

    if (!transfer || !product) {
      Log.error(
        `There is no actual transfers or product for entity with following id: ${entityId}`,
      );

      return;
    }

    const { id } = await this.sdk.transfers.create({
      amount: transfer.amount * payoutCoeff,
      currency: 'usd',
      destination: transfer.destinationUser,
    });

    const transaction = this.transactionRepository.create({
      transactionId: id,
      userId: transfer.userId,
      entityId,
      amount: transfer.amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.INITIAL,
      product: {
        productId: product.productId,
      },
    });

    await this.transactionRepository.save(transaction);
  }

  /**
   * Create PaymentIntent
   */
  public async createPaymentIntent({
    userId,
    entityCost,
    receiverId,
    cardId,
    title,
    applicationPaymentPercent,
    entityId,
    feesPayer,
    additionalFeesPercent,
    extraReceiverRevenuePercent,
  }: IPaymentIntentParams): Promise<[Transaction, Transaction]> {
    const senderCustomer = await this.customerRepository.findOne({ userId });
    const receiverCustomer = await this.customerRepository.findOne({ userId: receiverId });

    if (!senderCustomer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Sender customer account'),
      });
    }

    if (!receiverCustomer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Receiver customer account'),
      });
    }

    /**
     * Verify if customer is verified
     */
    const {
      userId: receiverUserId,
      params: { accountId: receiverAccountId, isVerified: isReceiverVerified },
    } = receiverCustomer;

    if (!receiverAccountId || !isReceiverVerified) {
      throw new BaseException({
        status: 400,
        message: "Receiver don't have setup or verified connected account",
      });
    }

    const {
      params: { paymentMethodId },
    } = await this.getChargingCard(senderCustomer.userId, cardId);

    const entityUnitCost = this.toSmallestCurrencyUnit(entityCost);

    /**
     * Calculate fees
     */
    const { userUnitAmount, receiverUnitRevenue, applicationUnitFee, paymentProviderUnitFee } =
      await this.getPaymentIntentFees({
        entityUnitCost,
        applicationPaymentPercent,
        feesPayer,
        additionalFeesPercent,
        extraReceiverRevenuePercent,
      });

    /* eslint-disable camelcase */
    const stripePaymentIntent: StripeSdk.PaymentIntent = await this.sdk.paymentIntents.create({
      ...(title ? { description: title } : {}),
      metadata: {
        ...(entityId ? { entityId } : {}),
      },
      payment_method_types: [StripePaymentMethods.CARD],
      confirm: true,
      currency: 'usd',
      capture_method: 'automatic',
      payment_method: paymentMethodId,
      customer: senderCustomer.customerId,
      // How much must sender must pay
      amount: userUnitAmount,
      transfer_data: {
        // How much must receive end user
        amount: receiverUnitRevenue,
        destination: receiverAccountId,
      },
    });

    /* eslint-enable camelcase */
    const transactionData = {
      entityId,
      title,
      paymentMethodId,
      transactionId: stripePaymentIntent.id,
      tax: paymentProviderUnitFee,
      fee: applicationUnitFee,
      params: {
        feesPayer,
      },
    };

    return Promise.all([
      this.transactionRepository.save({
        ...transactionData,
        userId: senderCustomer.userId,
        type: TransactionType.CREDIT,
        amount: userUnitAmount,
      }),
      this.transactionRepository.save({
        ...transactionData,
        userId: receiverUserId,
        type: TransactionType.DEBIT,
        amount: receiverUnitRevenue,
      }),
    ]);
  }

  /**
   * Refund transaction (payment intent)
   * NOTES:
   * Sender payed 106.39$: 100$ - entity cost, 3.39$ - stripe fees, 3$ - platform application fee.
   * In the end of refund sender will receive 100$ and platform revenue will be 3$.
   */
  public async refund({ transactionId }: IRefundParams): Promise<boolean> {
    const debitTransaction = await this.transactionRepository.findOne({
      transactionId,
      type: TransactionType.DEBIT,
    });

    if (!debitTransaction) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Transaction'),
      });
    }

    if (!debitTransaction.params.transferId) {
      throw new BaseException({
        status: 400,
        message: "Transaction don't have related transfer id and can't be refunded",
      });
    }

    /**
     * Returns refunds from receiver connect account to platform (application) account
     */
    await this.sdk.transfers.createReversal(debitTransaction.params.transferId);

    /**
     * Returns refunds from platform (application) account to sender
     */
    /* eslint-disable camelcase */
    await this.sdk.refunds.create({
      amount: debitTransaction.amount,
      payment_intent: debitTransaction.transactionId,
    });

    /* eslint-enable camelcase */
    return true;
  }

  /**
   * Creates payout transfers for given entities
   */
  public async payout(entitiesIds: { id: string; userId: string }[]) {
    const { payoutCoeff } = await remoteConfig();

    // TODO: create mechanism to rearrange/mark payouts with errors to deal with them later
    if (!payoutCoeff) {
      Log.error('Payout coefficient is not provided');

      return false;
    }

    await Promise.allSettled(
      entitiesIds.map(({ id, userId }) => this.createTransfer(id, userId, payoutCoeff)),
    );

    return true;
  }

  /**
   * Returns positive int amount
   * NOTE: Should return the positive integer representing how much
   * to charge in the smallest currency unit
   */
  public toSmallestCurrencyUnit(amount: number | string): number {
    /**
     * Convert the amount to a number if it's a string
     */
    const parsedAmount = typeof amount === 'string' ? Number(amount) : amount;

    return parsedAmount * 100;
  }

  /**
   * Returns float value from unit
   */
  public fromSmallestCurrencyUnit(amount: number): number {
    return amount / 100;
  }

  /**
   * Returns receiver payment amount
   * NOTES: How much end user will get after fees from transaction
   * 1. Stable unit - stable amount that payment provider charges
   * 2. Payment percent - payment provider fee percent for single transaction
   * Fees calculation:
   * 1. User pays fee
   * totalAmount = 106$, receiverReceiver = 100, taxFee = 3, applicationFee = 3
   * 2. Receiver pays fees
   * totalAmount = 100$, receiverReceiver = 94, taxFee = 3, applicationFee = 3
   */
  public async getPaymentIntentFees({
    entityUnitCost,
    feesPayer = TransactionRole.SENDER,
    additionalFeesPercent,
    applicationPaymentPercent = 0,
    extraReceiverRevenuePercent = 0,
  }: IGetPaymentIntentFeesParams): Promise<{
    paymentProviderUnitFee: number;
    applicationUnitFee: number;
    userUnitAmount: number;
    receiverUnitRevenue: number;
  }> {
    const { fees } = await remoteConfig();

    const { paymentPercent, stableUnit } = fees!;

    /**
     * Calculate additional fees
     */
    const receiverAdditionalFee = getPercentFromAmount(
      entityUnitCost,
      additionalFeesPercent?.receiver,
    );
    const senderAdditionalFee = getPercentFromAmount(entityUnitCost, additionalFeesPercent?.sender);

    /**
     * Additional receiver revenue from application percent
     */
    const extraReceiverUnitRevenue = getPercentFromAmount(
      entityUnitCost,
      extraReceiverRevenuePercent,
    );

    /**
     * How much percent from total amount will receive end user
     */
    const applicationUnitFee = getPercentFromAmount(entityUnitCost, applicationPaymentPercent);

    if (feesPayer === TransactionRole.SENDER) {
      const userTempUnitAmount = entityUnitCost + applicationUnitFee + senderAdditionalFee;
      const userUnitAmount = Math.round(
        (userTempUnitAmount + stableUnit) / (1 - paymentPercent / 100),
      );

      return {
        applicationUnitFee,
        userUnitAmount,
        paymentProviderUnitFee: Math.round(userUnitAmount - userTempUnitAmount),
        receiverUnitRevenue: Math.round(
          entityUnitCost - receiverAdditionalFee + extraReceiverUnitRevenue,
        ),
      };
    }

    const paymentProviderUnitFee =
      getPercentFromAmount(entityUnitCost, paymentPercent) + stableUnit;

    return {
      applicationUnitFee,
      paymentProviderUnitFee,
      userUnitAmount: Math.round(entityUnitCost + senderAdditionalFee),
      receiverUnitRevenue: Math.round(
        entityUnitCost -
          paymentProviderUnitFee -
          applicationUnitFee -
          receiverAdditionalFee +
          extraReceiverUnitRevenue,
      ),
    };
  }

  /**
   * Get and calculate transfer information
   */
  protected async getTransferInfo(
    entityId: string,
    userId: string,
  ): Promise<ITransferInfo | undefined> {
    const transactions = await this.transactionRepository.find({
      select: ['amount', 'userId'],
      where: { entityId, status: TransactionStatus.SUCCESS },
    });

    const destinationUser = await this.customerRepository.findOne({
      userId,
    });

    if (!destinationUser?.params.accountId) {
      Log.error(
        'Destination user who is being used for transfer doesnt have the connected account id',
      );

      return;
    }

    return transactions.reduce(
      (previousValue, transaction) => ({
        ...previousValue,
        amount: previousValue.amount + transaction.amount,
      }),
      {
        amount: 0,
        destinationUser: destinationUser.params.accountId,
        userId: transactions[0].userId,
      },
    );
  }

  /**
   * Check if external account is bank account
   */
  private isExternalAccountIsBankAccount(
    externalAccount: StripeSdk.BankAccount | StripeSdk.Card,
  ): externalAccount is StripeSdk.BankAccount {
    return externalAccount.object.startsWith('ba');
  }

  /**
   * Returns id or extracted id from data
   */
  private extractId<T extends { id: string }>(data: string | T): string {
    return typeof data === 'string' ? data : data.id;
  }

  /**
   * Returns card for charging payment
   */
  private async getChargingCard(userId: string, cardId?: string): Promise<Card> {
    let card: Card | undefined;

    /**
     * Find card that declared as the payment method
     */
    const cardQuery = this.cardRepository
      .createQueryBuilder('card')
      .where('card.userId = :userId', { userId })
      .andWhere('card.isDefault = true')
      .andWhere("card.params ->> 'paymentMethodId' IS NOT NULL");

    if (cardId) {
      card = await cardQuery.andWhere("card.params ->> 'cardId' = :cardId", { cardId }).getOne();
    } else {
      card = await cardQuery.getOne();
    }

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Card'),
      });
    }

    if (!card.params.paymentMethodId) {
      throw new BaseException({
        status: 400,
        message: "Amount can't be charged from this card. Card isn't specified is payment method.",
      });
    }

    if (card.params.cardId) {
      throw new BaseException({
        status: 400,
        message: "Amount can't be charged from this card. Card is related to the connect account.",
      });
    }

    return card;
  }

  /**
   * Returns customer by account id
   */
  private async getCustomerByAccountId(accountId: string): Promise<Customer> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .where("customer.params->>'accountId' = :value", { value: accountId })
      .getOne();

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    return customer;
  }

  /**
   * Returns card by card id
   * NOTE: Uses to search related connect account (external account) data
   */
  private async getCardById(cardId: string): Promise<Card> {
    const card = await this.cardRepository
      .createQueryBuilder('card')
      .where("card.params->>'cardId' = :value", { value: cardId })
      .getOne();

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Card'),
      });
    }

    return card;
  }

  /**
   * Returns bank account by bank account id
   * NOTE: Uses to search related connect account (external account) data
   */
  private async getBankAccountById(bankAccountId: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .where("bankAccount.params->>'bankAccountId' = :value", { value: bankAccountId })
      .getOne();

    if (!bankAccount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Bank account'),
      });
    }

    return bankAccount;
  }

  /**
   * Returns extracted transfer id from succeeded payment intent
   * NOTE: handles single paymentIntent charge
   */
  private extractTransferIdFromPaymentIntent(charges?: StripeSdk.Charge[]): string | undefined {
    if (!charges || charges.length < 0) {
      return;
    }

    const [charge] = charges;

    if (!charge?.transfer) {
      return;
    }

    return this.extractId(charge.transfer);
  }

  /**
   * Returns account link
   */
  private buildAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<StripeSdk.AccountLink> {
    return this.sdk.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      // eslint-disable-next-line camelcase
      refresh_url: refreshUrl,
      // eslint-disable-next-line camelcase
      return_url: returnUrl,
    });
  }

  /**
   * Check is allowed instant payout
   */
  private isAllowedInstantPayout(availablePayoutMethods?: TAvailablePaymentMethods): boolean {
    if (!availablePayoutMethods) {
      return false;
    }

    return availablePayoutMethods.includes('instant');
  }

  /**
   * Returns payout method data
   */
  private async getPayoutMethodData(
    payoutMethod?: IPayoutMethod,
  ): Promise<{ id?: string; isInstantPayoutAllow: boolean } | undefined> {
    if (!payoutMethod) {
      return;
    }

    const { method, id } = payoutMethod;

    /**
     * @TODO: Simplify this
     */
    if (method === 'card') {
      const card = await this.cardRepository.findOne(id);

      return {
        id: card?.params?.cardId,
        isInstantPayoutAllow: Boolean(card?.isInstantPayoutAllowed),
      };
    }

    const bankAccount = await this.bankAccountRepository.findOne(id);

    return {
      id: bankAccount?.params?.bankAccountId,
      isInstantPayoutAllow: Boolean(bankAccount?.isInstantPayoutAllowed),
    };
  }

  /**
   * Set default payment method
   */
  private async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    await this.sdk.customers.update(customerId, {
      // eslint-disable-next-line camelcase
      invoice_settings: {
        // eslint-disable-next-line camelcase
        default_payment_method: paymentMethodId,
      },
    });
  }
}

export default Stripe;
