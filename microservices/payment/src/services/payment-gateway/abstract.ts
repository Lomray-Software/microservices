import { EntityManager, Repository } from 'typeorm';
import PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';

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
   * @constructor
   */
  public constructor(paymentProvider: Abstract['paymentProvider'], manager: EntityManager) {
    this.paymentProvider = paymentProvider;
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
   * Create new customer
   */
  public abstract createCustomer(userId: string): Promise<Customer>;
}

export default Abstract;
