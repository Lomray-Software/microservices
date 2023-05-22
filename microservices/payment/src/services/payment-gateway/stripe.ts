import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import type { EntityManager } from 'typeorm';
import remoteConfig from '@config/remote';
import type PaymentProvider from '@constants/payment-provider';
import StripeAccountTypes from '@constants/stripe-acoount-types';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import Transaction from '@entities/transaction';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import messages from '@helpers/validators/messages';
import type IStripeOptions from '@interfaces/stripe-options';
import Abstract, { IPriceParams, IProductParams } from './abstract';

export interface IStripeProductParams extends IProductParams {
  name: string;
  description?: string;
  images?: string[];
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

/**
 * Stripe payment provider
 */
class Stripe extends Abstract {
  /**
   * @protected
   */
  protected readonly paymentEntity: StripeSdk;

  /**
   * @protected
   */
  protected readonly paymentOptions: IStripeOptions;

  /**
   * @constructor
   */
  constructor(
    manager: EntityManager,
    paymentProvider: PaymentProvider.STRIPE,
    paymentOptions: IStripeOptions,
  ) {
    super(paymentProvider, paymentOptions, manager);

    this.paymentEntity = new StripeSdk(paymentOptions.apiKey, paymentOptions.config);
  }

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

    const { client_secret: clientSecret } = await this.paymentEntity.setupIntents.create({
      customer: customerId,
      // eslint-disable-next-line camelcase
      payment_method_types: this.paymentOptions.methods,
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
    const { id }: StripeSdk.Customer = await this.paymentEntity.customers.create();

    return super.createCustomer(userId, id);
  }

  /**
   * Get unified transaction status
   */
  public getStatus(stripeStatus: StripeTransactionStatus): TransactionStatus {
    switch (stripeStatus) {
      case StripeTransactionStatus.PAID:
        return TransactionStatus.SUCCESS;
      case StripeTransactionStatus.UNPAID:
        return TransactionStatus.REQUIRED_PAYMENT;
      case StripeTransactionStatus.ERROR:
        return TransactionStatus.ERROR;
      case StripeTransactionStatus.NO_PAYMENT_REQUIRED:
        return TransactionStatus.IN_PROCESS;
    }
  }

  /**
   * Create Product entity
   */
  public async createProduct(params: IStripeProductParams): Promise<Product> {
    const { entityId, name, description, images, userId } = params;

    const { id }: StripeSdk.Product = await this.paymentEntity.products.create({
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

    const { id }: StripeSdk.Price = await this.paymentEntity.prices.create({
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
    const price = await this.priceRepository.findOne({ priceId });

    if (!price) {
      Log.error(`There is no price related to this priceId: ${priceId}`);

      return null;
    }

    /* eslint-disable camelcase */
    const { id, url } = await this.paymentEntity.checkout.sessions.create({
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
  ): Promise<StripeSdk.AccountLink> {
    const customer = await super.getCustomer(userId);

    if (!customer.params.accountId) {
      const stripeConnectAccount: StripeSdk.Account = await this.paymentEntity.accounts.create({
        type: accountType,
        country: 'US',
        email,
      });

      customer.params.accountId = stripeConnectAccount.id;

      await this.customerRepository.save(customer);
    }

    return this.paymentEntity.accountLinks.create({
      account: customer.params.accountId as string,
      type: 'account_onboarding',
      // eslint-disable-next-line camelcase
      refresh_url: refreshUrl,
      // eslint-disable-next-line camelcase
      return_url: returnUrl,
    });
  }

  /**
   * Get the webhook from stripe and handle deciding on type of event
   */
  public handleWebhookEvent(payload: string, signature: string, webhookKey: string): void {
    const event = this.paymentEntity.webhooks.constructEvent(payload, signature, webhookKey);

    switch (event.type) {
      case 'checkout.session.completed':
        void this.handleTransactionCompleted(event);
        break;

      /**
       * @TODO: Handle if needed and setup_intent.canceled
       * Will be called when intent will be approved
       */
      case 'setup_intent.succeeded':
        void this.handleSetupIntentSucceed(event);
        break;

      /**
       * @TODO: Handle if needed account.external_account.updated and account.external_account.deleted
       * Will be called when customer setup connect account with card or bank account
       */
      case 'account.external_account.created':
        void this.handleExternalAccountCreate(event);
        break;

      case 'customer.update':
        void this.handleCustomerUpdate(event);
        break;
    }
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
        message: "The SetupIntent payment method doesn't exist",
      });
    }

    /**
     * Get payment method data
     */
    const paymentMethod = await this.paymentEntity.paymentMethods.retrieve(
      this.extractId(payment_method),
      {
        expand: [StripePaymentMethods.CARD],
      },
    );

    if (!paymentMethod?.card || !paymentMethod?.customer) {
      throw new BaseException({
        status: 500,
        message: 'The payment method card or customer data is invalid',
      });
    }

    const customer = await this.customerRepository.findOne({
      customerId: this.extractId(paymentMethod.customer),
    });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.customerNotFound,
      });
    }

    const {
      id,
      card: { brand: type, last4: lastDigits, exp_month, exp_year },
    } = paymentMethod;

    const { userId } = customer;

    const isDefault = await this.isFirstAddedCard(userId);

    /* eslint-enable camelcase */
    await this.cardRepository.save({
      lastDigits,
      type,
      isDefault,
      userId,
      expired: toExpirationDate(exp_month, exp_year),
      params: { isApproved: true, paymentMethodId: id },
    });
  }

  /**
   * Handles connect account update
   * NOTE: Should be called when webhook triggers
   */
  public async handleExternalAccountCreate(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: 'The connected account reference in external account data not found',
      });
    }

    const { userId } = await this.getCustomerByAccountId(this.extractId(externalAccount.account));

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const { id: cardId, last4: lastDigits, brand: type, exp_year, exp_month } = externalAccount;

      const isDefault = await this.isFirstAddedCard(userId);

      await this.cardRepository.save({
        lastDigits,
        type,
        userId,
        isDefault,
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
    } = externalAccount as StripeSdk.BankAccount;

    await this.bankAccountRepository.save({
      bankAccountId,
      lastDigits,
      userId,
      holderName,
      bankName,
      params: { bankAccountId },
    });
    /* eslint-enable camelcase */
  }

  /**
   * Handles customer update
   */
  public async handleCustomerUpdate(event: StripeSdk.Event) {
    /* eslint-disable camelcase */
    const {
      id,
      charges_enabled: isChargesEnabled,
      capabilities,
    } = event.data.object as StripeSdk.Account;

    const customer = await this.getCustomerByAccountId(id);

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.customerNotFound,
      });
    }

    /**
     * Check if customer can accept payment
     * NOTE: Check if user correctly and verify setup connect account
     */
    customer.params.isVerified = isChargesEnabled && capabilities?.transfers === 'active';

    await this.customerRepository.save(customer);
    /* eslint-enable camelcase */
  }

  /**
   * Handles completing of transaction inside stripe payment process
   */
  public async handleTransactionCompleted(event: StripeSdk.Event): Promise<Transaction | void> {
    /* eslint-disable camelcase */
    const { id, payment_status, status } = event.data.object as ICheckoutEvent;

    await this.transactionRepository.update(
      { transactionId: id },
      {
        status: this.getStatus(payment_status as StripeTransactionStatus),
        params: {
          checkoutStatus: status as StripeCheckoutStatus,
          paymentStatus: payment_status as StripeTransactionStatus,
        },
      },
    );
    /* eslint-enable camelcase */
  }

  /**
   * Create transfer for connected account
   */
  public async createTransfer(entityId: string, userId: string, payoutCoeff: number) {
    const transfer = await this.getTransferInfo(entityId, userId);

    if (!transfer) {
      Log.error(`There is no actual transfers for entity with following id: ${entityId}`);

      return;
    }

    const { id } = await this.paymentEntity.transfers.create({
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
    });

    await this.transactionRepository.save(transaction);
  }

  /**
   * Create PaymentIntent with Capture
   * NOTES:
   * allAmount - Full amount that will be charged from card
   * usersAmount - Amount that will receive end user
   * usersConnectedAccount - End user connected account
   */
  public async createPaymentIntentWithCapture(
    userId: string,
    allAmount: number,
    usersAmount: number,
    usersConnectedAccount: string,
    cardId?: string,
  ) {
    const customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.customerNotFound,
      });
    }

    const {
      params: { paymentMethodId },
    } = await this.getChargingCard(cardId);

    /* eslint-disable camelcase */
    const stripePaymentIntent: StripeSdk.PaymentIntent =
      await this.paymentEntity.paymentIntents.create({
        amount: allAmount,
        currency: 'usd',
        payment_method_types: [StripePaymentMethods.CARD],
        payment_method: paymentMethodId,
        capture_method: 'manual',
        customer: customer.customerId,
        transfer_data: {
          amount: usersAmount,
          destination: usersConnectedAccount,
        },
      });

    const stripeCapturePaymentIntent: StripeSdk.PaymentIntent =
      await this.paymentEntity.paymentIntents.capture(stripePaymentIntent.id, {
        amount_to_capture: allAmount,
      });

    return stripeCapturePaymentIntent;
    /* eslint-enable camelcase */
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
   * Get and calculate transfer information
   * @protected
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
   * Check is first added card
   */
  private async isFirstAddedCard(userId: string): Promise<boolean> {
    return (
      (await this.cardRepository.count({
        userId,
      })) === 0
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
  private async getChargingCard(cardId?: string): Promise<Card> {
    let card: Card | undefined;

    if (cardId) {
      card = await this.cardRepository.findOne({ id: cardId });
    } else {
      card = await this.cardRepository.findOne({ where: { isDefault: true } });
    }

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.cardNotFound,
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
        message: messages.customerNotFound,
      });
    }

    return customer;
  }
}

export default Stripe;
