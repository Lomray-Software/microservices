import { EntityManager, Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import ConnectAccount from '@entities/connect-account';
import Customer from '@entities/customer';
import type TPaymentOptions from '@interfaces/payment-options';

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
  protected readonly paymentOptions: TPaymentOptions;

  /**
   * @protected
   */
  protected readonly connectAccountRepository: Repository<ConnectAccount>;

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

  /**
   * Get connect account
   */
  protected async getConnectAccount(userId: string) {
    const connectAccount = await this.connectAccountRepository.findOne(userId);

    if (connectAccount) {
      return connectAccount;
    }

    return this.createConnectAccount(userId);
  }

  /**
   * Create new connect account
   */
  public async createConnectAccount(userId: string, connectAccountId: string = uuid()) {
    const connectAccount = this.connectAccountRepository.create({
      connectAccountId,
      userId,
    });

    await this.customerRepository.save(connectAccount);

    return connectAccount;
  }
}

export default Abstract;
