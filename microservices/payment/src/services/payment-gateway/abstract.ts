import { EntityManager, Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import type TPaymentOptions from '@interfaces/payment-options';

export interface ICardParams {
  test: boolean;
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
  protected readonly priceRepository: Repository<Price>;

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
   * Create new product
   */
  public async createProduct(params: IProductParams) {
    const { entityId, userId } = params;

    const product = this.productRepository.create({
      entityId,
      userId,
      productId: uuid(),
    });

    await this.productRepository.save(product);

    return product;
  }

  /**
   * Create new price
   */
  public async createPrice(params: IPriceParams, priceId: string = uuid()) {
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
