import StripeSdk from 'stripe';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import type PaymentProvider from '@constants/payment-provider';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import type IStripeOptions from '@interfaces/stripe-options';
import Abstract, { IPriceParams, IProductParams } from './abstract';

export interface IStripeProductParams extends IProductParams {
  name: string;
  description?: string;
  images?: string[];
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
   * @protected
   */
  protected readonly productRepository: Repository<Product>;

  /**
   * @protected
   */
  protected readonly priceRepository: Repository<Price>;

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
    this.productRepository = manager.getRepository(Product);
    this.priceRepository = manager.getRepository(Price);
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
    const customer = await super.getCustomer(userId);

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

    return super.createCustomer(userId, stripeCustomer.id);
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

    return this.productRepository.create({
      entityId,
      userId,
      productId: id,
    });
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

    return this.priceRepository.create({
      priceId: id,
      userId,
      productId,
      currency,
      unitAmount,
    });
  }
}

export default Stripe;
