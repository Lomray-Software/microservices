import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import type TPaymentOptions from '@interfaces/payment-options';
import Abstract from './abstract';

/**
 * Stripe payment provider
 */
class Stripe extends Abstract {
  /**
   * @protected
   */
  protected readonly paymentOptions: TPaymentOptions;

  /**
   * @protected
   */
  protected readonly paymentEntity: StripeSdk;

  constructor(
    manager: EntityManager,
    paymentProvider: Abstract['paymentProvider'],
    paymentOptions: TPaymentOptions,
  ) {
    super(paymentProvider, manager);

    this.paymentOptions = paymentOptions;
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
    let customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      customer = await this.createCustomer(userId);
    }

    const { client_secret: clientSecret } = await this.paymentEntity.setupIntents.create({
      customer: customer.customerId,
      // eslint-disable-next-line camelcase
      payment_method_types: this.paymentOptions.methods,
    });

    return clientSecret;
  }

  /**
   * Create Customer entity
   */
  public async createCustomer(userId: string): Promise<Customer> {
    const stripeCustomer: StripeSdk.Customer = await this.paymentEntity.customers.create();

    const customer = this.customerRepository.create({
      customerId: stripeCustomer.id,
      userId,
    });

    return this.customerRepository.save(customer);
  }
}

export default Stripe;
