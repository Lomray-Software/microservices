import type Stripe from 'stripe';
import { EntityManager, Repository } from 'typeorm';
import PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import TPaymentOptions from '@interfaces/payment-options';

export interface ICardParams {
  test: boolean;
}

export interface IBankAccountParams {
  test: boolean;
}

export interface ICustomerParams {
  userId: string;
}

export interface ISetupIntentParams {
  userId: string;
}

export type TPaymentEntity = Stripe;

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
  protected readonly paymentOptions: TPaymentOptions;

  /**
   * @protected
   */
  protected readonly paymentEntity: TPaymentEntity;

  /**
   * @protected
   */
  protected readonly customerRepository: Repository<Customer>;

  /**
   * @constructor
   */
  public constructor(
    paymentProvider: Abstract['paymentProvider'],
    paymentEntity: Abstract['paymentEntity'],
    manager: EntityManager,
    paymentOptions: Abstract['paymentOptions'],
  ) {
    this.paymentProvider = paymentProvider;
    this.paymentOptions = paymentOptions;
    this.paymentEntity = paymentEntity;
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

  /**
   * Create setup intent
   */
  public abstract createSetupIntent(userId: string): Promise<string | null>;
}

export default Abstract;
