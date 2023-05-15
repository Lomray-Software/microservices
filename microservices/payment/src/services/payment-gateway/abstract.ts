import { EntityManager, Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import CardType from '@constants/card-type';
import PaymentProvider from '@constants/payment-provider';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import Transaction, { ITransactionParams as ITransactionEntityParams } from '@entities/transaction';
import type TPaymentOptions from '@interfaces/payment-options';

export interface ICardParams {
  cardId: string;
  number: string;
  expired: string;
  holderName: string;
  type: CardType;
  userId: string;
  isDefault?: boolean;
}

export interface IBankAccountParams {
  test: boolean;
}

export interface IPriceParams {
  productId: string;
  userId: string;
  currency: string;
  unitAmount: number;
}

export interface ITransactionParams {
  status: TransactionStatus;
  amount: number;
  userId: string;
  title?: string;
  bankAccountId?: string;
  productId?: string;
  cardId?: string;
  entityId?: string;
  type?: TransactionType;
  tax?: number;
  fee?: number;
  params?: ITransactionEntityParams;
}

export interface IProductParams {
  entityId: string;
  userId: string;
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
  protected readonly productRepository: Repository<Product>;

  /**
   * @protected
   */
  protected readonly cardRepository: Repository<Card>;

  /**
   * @protected
   */
  protected readonly priceRepository: Repository<Price>;

  /**
   * @protected
   */
  protected readonly transactionRepository: Repository<Transaction>;

  /**
   * @protected
   */
  protected readonly paymentOptions: TPaymentOptions;

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
    this.productRepository = manager.getRepository(Product);
    this.priceRepository = manager.getRepository(Price);
    this.transactionRepository = manager.getRepository(Transaction);
    this.cardRepository = manager.getRepository(Card);
  }

  /**
   * Add new bank account
   */
  public abstract addBankAccount(params: IBankAccountParams): Promise<BankAccount>;

  /**
   * Add new card
   */
  public async addCard(params: ICardParams, cardId: string = uuid()): Promise<Card> {
    const card = this.cardRepository.create({
      ...params,
      cardId: params?.cardId || cardId,
    });

    await this.cardRepository.save(card);

    return card;
  }

  /**
   * Create new transaction
   */
  public async createTransaction(
    params: ITransactionParams,
    transactionId = uuid(),
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({ ...params, transactionId });

    await this.transactionRepository.save(transaction);

    return transaction;
  }

  /**
   * Get the customer
   */
  protected async getCustomer(userId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ userId });

    if (customer) {
      return customer;
    }

    return this.createCustomer(userId);
  }

  /**
   * Create new customer
   */
  public async createCustomer(userId: string, customerId: string = uuid()): Promise<Customer> {
    const customer = this.customerRepository.create({
      customerId,
      userId,
    });

    await this.customerRepository.save(customer);

    return customer;
  }

  /**
   * Create new product
   */
  public async createProduct(params: IProductParams, productId: string = uuid()): Promise<Product> {
    const { entityId, userId } = params;

    const product = this.productRepository.create({
      entityId,
      userId,
      productId,
    });

    await this.productRepository.save(product);

    return product;
  }

  /**
   * Create new price
   */
  public async createPrice(params: IPriceParams, priceId: string = uuid()): Promise<Price> {
    const { productId, currency, unitAmount, userId } = params;

    const price = this.priceRepository.create({
      priceId,
      productId,
      userId,
      currency,
      unitAmount,
    });

    await this.priceRepository.save(price);

    return price;
  }
}

export default Abstract;
