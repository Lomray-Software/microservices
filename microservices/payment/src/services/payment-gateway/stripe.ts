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
    let customer = await super.getCustomer(userId);

    if (!customer.params.accountId) {
      const stripeConnectAccount: StripeSdk.Account = await this.paymentEntity.accounts.create({
        type: accountType,
        country: 'US',
        email,
      });

      await this.customerRepository.update(userId, {
        params: { accountId: stripeConnectAccount.id },
      });

      customer = { ...customer, params: { accountId: stripeConnectAccount.id } };
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

      case 'setup_intent.succeeded':
        void this.handleSetupIntent(event);
        break;

      case 'account.update':
        void this.handleConnectAccountUpdate(event);
        break;

      case 'account.external_account.created':
        void this.handleExternalAccountCreate(event);
    }
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
   * Handles setup intent succeed
   * NOTE: Should be called when webhook triggers
   */
  public async handleSetupIntent(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const { payment_method } = event.data.object as StripeSdk.SetupIntent;

    if (!payment_method) {
      throw new BaseException({
        status: 500,
        message: "The SetupIntent payment method doesn't exist",
      });
    }

    const paymentMethodId = typeof payment_method === 'string' ? payment_method : payment_method.id;

    /**
     * Get payment method data
     */
    const paymentMethod = await this.paymentEntity.paymentMethods.retrieve(paymentMethodId, {
      expand: [StripePaymentMethods.CARD],
    });

    if (!paymentMethod?.card || !paymentMethod?.customer) {
      throw new BaseException({
        status: 500,
        message: 'The payment method card or customer data is invalid',
      });
    }

    /**
     * Get customer
     */
    const customerId =
      typeof paymentMethod.customer === 'string'
        ? paymentMethod.customer
        : paymentMethod.customer.id;

    const customer = await super.customerRepository.findOne({
      customerId,
    });

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: "Customer doesn't exist",
      });
    }

    /**
     * Check user have added other cards
     */
    const isFirstAddedCard = (await this.cardRepository.count({ userId: customer.userId })) === 0;

    const {
      id: cardId,
      card: { brand: type, last4: lastDigits, exp_month, exp_year },
    } = paymentMethod;

    /* eslint-enable camelcase */
    await super.createCard({
      cardId,
      lastDigits,
      type,
      userId: customer.userId,
      expired: toExpirationDate(exp_month, exp_year),
      isDefault: isFirstAddedCard,
    });
  }

  /**
   * Handles connect account update
   * NOTE: Should be called when webhook triggers
   */
  public async handleConnectAccountUpdate(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const connectAccount = event.data.object as StripeSdk.Account;

    const customer = await super.customerRepository.findOne({
      params: { accountId: connectAccount.id },
    });
    /* eslint-enable camelcase */

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: 'Customer with the received account id not found',
      });
    }

    /**
     * If charges and transfer in pending (on account init) or inactive on update
     */
    if (!this.isCustomerCanAcceptPayments(connectAccount)) {
      customer.params.isVerified = false;

      await super.customerRepository.save(customer);

      return;
    }

    customer.params.isVerified = true;

    await super.customerRepository.save(customer);
  }

  /**
   * Handle external account create
   * NOTE: Register only bank accounts as external account
   */
  public handleExternalAccountCreate(event: StripeSdk.Event) {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card;

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      return;
    }
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
   * Check if customer can accept payment
   * NOTE: Check if user correctly and verify setup connect account
   */
  private isCustomerCanAcceptPayments({
    charges_enabled: isChargesEnabled,
    capabilities,
  }: StripeSdk.Account) {
    return isChargesEnabled && capabilities?.transfers === 'active';
  }

  /**
   * Check if external account is bank account
   */
  private isExternalAccountIsBankAccount(
    externalAccount: StripeSdk.BankAccount | StripeSdk.Card,
  ): externalAccount is StripeSdk.BankAccount {
    return externalAccount.object.startsWith('ba');
  }
}

export default Stripe;
