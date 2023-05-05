import { Log } from '@lomray/microservice-helpers';
import StripeSdk from 'stripe';
import type { EntityManager } from 'typeorm';
import remoteConfig from '@config/remote';
import type PaymentProvider from '@constants/payment-provider';
import StripeAccountTypes from '@constants/stripe-acoount-types';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import Transaction from '@entities/transaction';
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
    try {
      const event = this.paymentEntity.webhooks.constructEvent(payload, signature, webhookKey);

      switch (event.type) {
        case 'checkout.session.completed':
          void this.handleTransactionCompleted(event);
          break;
      }
    } catch (err) {
      Log.error(`Webhook handler has following error ${err as string}`);
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
   * Get and calculate transfer information
   * @protected
   */
  protected async getTransfer(
    entityId: string,
    userId: string,
  ): Promise<{ amount: number; destinationUser: string; userId: string } | undefined> {
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
   * Create transfer for connected account
   */
  public async createTransfer(entityId: string, userId: string) {
    const { payoutCoeff } = await remoteConfig();
    const transfer = await this.getTransfer(entityId, userId);

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
  public payout(entitiesId: { id: string; userId: string }[]) {
    entitiesId.forEach(({ id, userId }) => {
      void this.createTransfer(id, userId);
    });

    return true;
  }
}

export default Stripe;