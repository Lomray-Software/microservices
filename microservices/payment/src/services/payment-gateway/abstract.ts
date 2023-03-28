import { EntityManager, Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import type TPaymentOptions from '@interfaces/payment-options';
import type IStripeOptions from '@interfaces/stripe-options';

export interface ICardParams {
  test: boolean;
}

export interface IBankAccountParams {
  test: boolean;
}

/**
 * Abstract class for payment gateway
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly paymentProvider: PaymentProvider;

  /**
   * @protected
   */
  protected readonly customerRepository: Repository<Customer>;

  /**
   * @protected
   */
  protected readonly paymentOptions: IStripeOptions;

  /**
   * @constructor
   */
  public constructor(
    paymentProvider: Abstract['paymentProvider'],
    paymentOptions: TPaymentOptions,
    manager: EntityManager,
  ) {
    this.paymentProvider = paymentProvider;
    this.paymentOptions = paymentOptions;
    this.customerRepository = manager.getRepository(Customer);
  }

  /**
   * Add new card
   */
  public abstract addCard(params: ICardParams): Promise<Card>;

  /**
   * Add new bank account
   */
  public abstract addBankAccount(params: IBankAccountParams): Promise<BankAccount>;

  /**
   * Get the customer
   */
  protected async getCustomer(userId: string) {
    const customer = await this.customerRepository.findOne(userId);

    if (customer) {
      return customer;
    }

    return this.createCustomer(userId);
  }

  /**
   * Create new customer
   */
  public async createCustomer(userId: string, customerId: string = uuid()) {
    const customer = this.customerRepository.create({
      customerId,
      userId,
    });

    await this.customerRepository.save(customer);

    return customer;
  }
}

export default Abstract;
