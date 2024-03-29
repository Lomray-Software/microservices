import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk, { Stripe as StripeTypes } from 'stripe';
import { EntityManager, In, Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import CouponDuration from '@constants/coupon-duration';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Cart from '@entities/cart';
import Coupon from '@entities/coupon';
import Customer from '@entities/customer';
import Dispute from '@entities/dispute';
import EvidenceDetails from '@entities/evidence-details';
import Payout from '@entities/payout';
import Price from '@entities/price';
import Product from '@entities/product';
import Refund from '@entities/refund';
import Transaction from '@entities/transaction';
import type { IParams as ITransactionEntityParams } from '@entities/transaction';
import messages from '@helpers/validators/messages';

export interface ICardParams {
  userId: string;
  token?: string;
  expired?: string;
  digits?: string;
  cvc?: string;
}

export interface IBankAccountParams {
  userId: string;
  lastDigits: string;
  holderName?: string | null;
  bankName?: string | null;
  bankAccountId?: string;
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

export interface ICouponParams {
  duration: CouponDuration;
  products: string[];
  userId?: string;
  name?: string;
  maxRedemptions?: number;
  durationInMonths?: number;
  amountOff?: number;
  percentOff?: number;
}

/**
 * Abstract class for payment gateway
 */
abstract class Abstract {
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
  protected readonly bankAccountRepository: Repository<BankAccount>;

  /**
   * @protected
   */
  protected readonly priceRepository: Repository<Price>;

  /**
   * @protected
   */
  protected readonly cartRepository: Repository<Cart>;

  /**
   * @protected
   */
  protected readonly transactionRepository: Repository<Transaction>;

  /**
   * @protected
   */
  protected readonly disputeRepository: Repository<Dispute>;

  /**
   * @protected
   */
  protected readonly evidenceDetailsRepository: Repository<EvidenceDetails>;

  /**
   * @protected
   */
  protected readonly refundRepository: Repository<Refund>;

  /**
   * @protected
   */
  protected readonly couponRepository: Repository<Coupon>;

  /**
   * @protected
   */
  protected readonly payoutRepository: Repository<Payout>;

  /**
   * @protected
   */
  protected readonly manager: EntityManager;

  /**
   * @protected
   */
  protected readonly sdk: StripeSdk;

  /**
   * @protected
   */
  protected readonly methods: string[];

  /**
   * @constructor
   */
  public constructor(
    manager: EntityManager,
    apiKey: string,
    stripeConfig: StripeTypes.StripeConfig,
    methods: string[],
  ) {
    this.customerRepository = manager.getRepository(Customer);
    this.productRepository = manager.getRepository(Product);
    this.priceRepository = manager.getRepository(Price);
    this.cartRepository = manager.getRepository(Cart);
    this.transactionRepository = manager.getRepository(Transaction);
    this.refundRepository = manager.getRepository(Refund);
    this.cardRepository = manager.getRepository(Card);
    this.bankAccountRepository = manager.getRepository(BankAccount);
    this.couponRepository = manager.getRepository(Coupon);
    this.disputeRepository = manager.getRepository(Dispute);
    this.evidenceDetailsRepository = manager.getRepository(EvidenceDetails);
    this.payoutRepository = manager.getRepository(Payout);
    this.methods = methods;
    this.sdk = new StripeSdk(apiKey, stripeConfig);
    this.manager = manager;
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
   * Create new transaction
   */
  public async createTransaction(
    params: ITransactionParams,
    transactionId = uuid(),
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...params,
      product: { productId: params.productId },
      customer: { userId: params.userId },
      transactionId,
    });

    await this.transactionRepository.save(transaction);

    return transaction;
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

  /**
   * Get transaction by transactionId
   */
  public async getTransactionById(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({ id: transactionId });

    if (!transaction) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Transaction'),
      });
    }

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
   * Create coupon
   */
  protected async createCoupon(params: ICouponParams, couponId: string): Promise<Coupon> {
    const products = await this.productRepository.find({
      where: {
        productId: In(params.products),
      },
    });

    if (!products || products.length !== params.products.length) {
      throw new BaseException({
        status: 400,
        message: "One or more products don't exists.",
      });
    }

    const coupon = this.couponRepository.create({
      ...params,
      couponId,
      products,
    });

    await this.couponRepository.save(coupon);

    return coupon;
  }
}

export default Abstract;
