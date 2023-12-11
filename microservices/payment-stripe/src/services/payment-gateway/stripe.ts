import { Log } from '@lomray/microservice-helpers';
import { BaseException, Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { validate } from 'class-validator';
import StripeSdk from 'stripe';
import remoteConfig from '@config/remote';
import BalanceType from '@constants/balance-type';
import BusinessType from '@constants/business-type';
import CouponDuration from '@constants/coupon-duration';
import RefundAmountType from '@constants/refund-amount-type';
import RefundStatus from '@constants/refund-status';
import StripeAccountTypes from '@constants/stripe-account-types';
import StripeCheckoutStatus from '@constants/stripe-checkout-status';
import StripePaymentMethods from '@constants/stripe-payment-methods';
import StripeRefundStatus from '@constants/stripe-refund-status';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionRole from '@constants/transaction-role';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import BankAccount from '@entities/bank-account';
import Card from '@entities/card';
import Coupon from '@entities/coupon';
import Customer from '@entities/customer';
import Price from '@entities/price';
import Product from '@entities/product';
import Refund from '@entities/refund';
import Transaction, { defaultParams as defaultTransactionParams } from '@entities/transaction';
import composeBalance from '@helpers/compose-balance';
import fromExpirationDate from '@helpers/formatters/from-expiration-date';
import toExpirationDate from '@helpers/formatters/to-expiration-date';
import getPercentFromAmount from '@helpers/get-percent-from-amount';
import messages from '@helpers/validators/messages';
import TBalance from '@interfaces/balance';
import TCurrency from '@interfaces/currency';
import IFees from '@interfaces/fees';
import type ITax from '@interfaces/tax';
import CardRepository from '@repositories/card';
import CustomerRepository from '@repositories/customer';
import Calculation from '@services/calculation';
import Parser from '@services/parser';
import WebhookHandlers from '@services/webhook-handlers';
import type {
  IBankAccountParams,
  ICardParams,
  ICouponParams,
  IPriceParams,
  IProductParams,
} from './abstract';
import Abstract from './abstract';

export interface IStripeProductParams extends IProductParams {
  name: string;
  description?: string;
  // @TODO: Expected: ImagesUrl?
  images?: string[];
}

interface IPaymentIntentParams {
  userId: string;
  receiverId: string;
  // Original cost of entity for which will be pay user
  entityCost: number;
  // Set who will be pay for provider and application fees
  feesPayer?: TransactionRole;
  cardId?: string;
  title?: string;
  // Original application fee
  applicationPaymentPercent?: number;
  entityId?: string;
  // Additional fee that should pay one of the transaction contributor
  additionalFeesPercent?: Record<TransactionRole, number>;
  // Extra receiver revenue percent from application payment percent
  extraReceiverRevenuePercent?: number;
  withTax?: boolean;
}

interface IRefundParams {
  transactionId: string;
  refundAmountType?: RefundAmountType;
  amount?: number;
  /**
   * If user don't have required amount in connect account, he must provide
   * bank account or card id that will be used for refund charge
   */
  bankAccountId?: string;
  cardId?: string;
  entityId?: string;
  // Abstract entity type
  type?: string;
}

interface ICheckoutParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  isAllowPromoCode?: boolean;
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

interface ITransferInfo {
  amount: number;
  destinationUser: string;
  userId: string;
}

interface IPayoutMethod {
  id: string;
  method: 'card' | 'bankAccount';
}

interface IInstantPayoutParams {
  userId: string;
  amount: number;
  payoutMethod?: IPayoutMethod;
  currency?: TCurrency;
}

type TCustomerBalance = Record<BalanceType, TBalance>;

interface IGetPaymentIntentFeesParams
  extends Pick<
    IPaymentIntentParams,
    | 'applicationPaymentPercent'
    | 'feesPayer'
    | 'additionalFeesPercent'
    | 'extraReceiverRevenuePercent'
  > {
  entityUnitCost: number;
  shouldEstimateTax?: boolean;
  withStripeFee?: boolean;
}

type TAvailablePaymentMethods =
  | StripeSdk.Card.AvailablePayoutMethod[]
  | StripeSdk.BankAccount.AvailablePayoutMethod[]
  | null;

interface IPaymentIntentFees {
  stripeUnitFee: number;
  platformUnitFee: number;
  userUnitAmount: number;
  receiverUnitRevenue: number;
  receiverAdditionalFee: number;
  senderAdditionalFee: number;
  extraReceiverUnitRevenue: number;
  estimatedTaxUnit?: number;
  estimatedTaxPercent?: number;
}

type TCardData =
  | StripeSdk.PaymentMethodCreateParams.Card1
  | StripeSdk.PaymentMethodCreateParams.Card2;

interface IStripeCouponParams extends ICouponParams {
  currency?: TCurrency;
}

interface IStripePromoCodeParams {
  couponId: string;
  code?: string;
  maxRedemptions?: number;
}

interface ICreateMultipleProductCheckoutParams {
  cartId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}

/**
 * Stripe payment provider
 */
class Stripe extends Abstract {
  /**
   * Add new card
   * @description Definitions:
   * 1. Usage example - only in integration tests
   * 2. Use setup intent for live-mode
   * 3. For creating card manually with the sensitive data such as digits, cvc. Platform
   * account must be eligible for PCI (Payment Card Industry Data Security Standards)
   */
  public async addCard(params: ICardParams): Promise<Card> {
    const customer = await this.customerRepository.findOne({ where: { userId: params.userId } });

    if (!customer) {
      throw new BaseException({ status: 500, message: messages.getNotFoundMessage('Customer') });
    }

    const cardData = this.buildCardData(params);

    if (!cardData) {
      throw new BaseException({ status: 400, message: 'Provided card data is invalid.' });
    }

    /**
     * Create card as the payment method
     */
    const { id, card: stripeCard } = await this.sdk.paymentMethods.create({
      type: 'card',
      card: cardData,
      expand: ['card'],
    });

    if (!stripeCard?.exp_month || !stripeCard?.exp_year) {
      throw new BaseException({ status: 500, message: 'Failed to get card expiration date.' });
    }

    /**
     * Attach card to customer
     */
    await this.sdk.paymentMethods.attach(id, {
      customer: customer.customerId,
    });

    /**
     * Validate and save card
     */
    const card = this.cardRepository.create({
      expired: toExpirationDate(stripeCard.exp_month, stripeCard.exp_year),
      userId: params.userId,
      funding: stripeCard?.funding,
      brand: stripeCard?.brand,
      lastDigits: stripeCard?.last4,
      params: { paymentMethodId: id },
    });

    const errors = await validate(card, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: `Validation failed for card.`,
        payload: errors,
      });
    }

    return this.cardRepository.save(card);
  }

  /**
   * Add bank account
   * @description Usage example - integration tests
   * @TODO: Integrate with stripe
   */
  public async addBankAccount({
    bankAccountId,
    ...rest
  }: IBankAccountParams): Promise<BankAccount> {
    const bankAccount = this.bankAccountRepository.create({
      ...rest,
      params: { bankAccountId },
    });

    const errors = await validate(bankAccount, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: `Validation failed for bank account.`,
        payload: errors,
      });
    }

    return this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Create SetupIntent and return to client secret
   * @description Use on session usage for checkouts
   */
  public async setupIntent(userId: string): Promise<string | null> {
    const { setupIntentUsage } = await remoteConfig();

    // Get related customer
    const { customerId } = await super.getCustomer(userId);

    const { client_secret: clientSecret } = await this.sdk.setupIntents.create({
      usage: setupIntentUsage,
      customer: customerId,
      // eslint-disable-next-line camelcase
      payment_method_types: this.methods,
    });

    return clientSecret;
  }

  /**
   * Create Customer entity
   */
  public async createCustomer(userId: string, email?: string, name?: string): Promise<Customer> {
    const { id }: StripeSdk.Customer = await this.sdk.customers.create({
      name,
      email,
    });

    return super.createCustomer(userId, id);
  }

  /**
   * Remove Customer from db and stripe
   * @description Usage example - integration tests
   */
  public async removeCustomer(userId: string): Promise<boolean> {
    const customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({ status: 400, message: messages.getNotFoundMessage('Customer') });
    }

    const { deleted: isDeleted } = await this.sdk.customers.del(customer.customerId);

    if (!isDeleted) {
      return false;
    }

    await this.customerRepository.remove(customer);

    return true;
  }

  /**
   * Create Product entity
   */
  public async createProduct(params: IStripeProductParams): Promise<Product> {
    const { entityId, name, description, images, userId } = params;

    const { id }: StripeSdk.Product = await this.sdk.products.create({
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

    const { id }: StripeSdk.Price = await this.sdk.prices.create({
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
    const { priceId, userId, successUrl, cancelUrl, isAllowPromoCode } = params;

    const { customerId } = await super.getCustomer(userId);
    const price = await this.priceRepository.findOne({ priceId }, { relations: ['product'] });

    if (!price) {
      Log.error(`There is no price related to this priceId: ${priceId}`);

      return null;
    }

    /* eslint-disable camelcase */
    const { id, url } = await this.sdk.checkout.sessions.create({
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
      allow_promotion_codes: isAllowPromoCode,
    });
    /* eslint-enable camelcase */

    await this.createTransaction(
      {
        type: TransactionType.CREDIT,
        amount: price.unitAmount,
        userId,
        productId: price.productId,
        entityId: price.product.entityId,
        status: TransactionStatus.INITIAL,
      },
      id,
    );

    return url;
  }

  /**
   * Create checkout session for existing cart and return url to redirect user for payment
   */
  public async createCartCheckout(
    params: ICreateMultipleProductCheckoutParams,
  ): Promise<string | null> {
    const { cartId, userId, successUrl, cancelUrl } = params;
    const { customerId } = await super.getCustomer(userId);

    const cart = await this.cartRepository.findOne(
      { id: cartId },
      {
        relations: ['items', 'items.price'],
      },
    );

    if (!cart) {
      Log.error(`There is no cart related to this cartId: ${cartId}`);

      return null;
    }

    const lineItems = cart.items.map(({ price, quantity }) => ({
      price: price.priceId,
      quantity,
    }));

    /* eslint-disable camelcase */
    const { id, url } = await this.sdk.checkout.sessions.create({
      // @ts-ignore
      line_items: lineItems,
      mode: 'payment',
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    /* eslint-enable camelcase */

    await this.createTransaction(
      {
        type: TransactionType.CREDIT,
        amount: cart.items.reduce((acc, item) => acc + item.price.unitAmount * item.quantity, 0),
        userId,
        entityId: cart.id,
        status: TransactionStatus.INITIAL,
      },
      id,
    );

    return url;
  }

  /**
   * Connect account
   * @description Create ConnectAccount make redirect to account link and save stripeConnectAccount in customer
   */
  public async connectAccount(
    userId: string,
    email: string,
    accountType: StripeAccountTypes,
    refreshUrl: string,
    returnUrl: string,
    businessType?: BusinessType,
  ): Promise<string> {
    const customer = await super.getCustomer(userId);

    if (!customer.params.accountId) {
      const stripeConnectAccount: StripeSdk.Account = await this.sdk.accounts.create({
        type: accountType,
        country: 'US',
        email,
        // eslint-disable-next-line camelcase
        ...(businessType ? { business_type: businessType } : {}),
        settings: {
          payouts: {
            // eslint-disable-next-line camelcase
            schedule: { interval: 'manual' },
          },
        },
      });

      customer.params.accountId = stripeConnectAccount.id;
      customer.params.accountType = stripeConnectAccount.type as StripeAccountTypes;

      await this.customerRepository.save(customer);
    }

    return (await this.buildAccountLink(customer.params.accountId, refreshUrl, returnUrl)).url;
  }

  /**
   * Returns dashboard login link
   * @description Eligible only for the express connect accounts.
   * DO NOT email, text, or otherwise send login link URLs directly to user
   */
  public async getDashboardLoginLink(userId: string): Promise<string> {
    const customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have setup connect account",
      });
    }

    if (customer.params.accountType !== 'express') {
      throw new BaseException({
        status: 500,
        message: 'Dashboard login allowed only for express accounts.',
      });
    }

    return (await this.sdk.accounts.createLoginLink(customer.params.accountId)).url;
  }

  /**
   * Returns account link
   * @description Use when user needs to update connect account data
   */
  public async getConnectAccountLink(
    userId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<string> {
    const customer = await this.customerRepository.findOne({ userId });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have setup connect account",
      });
    }

    return (await this.buildAccountLink(customer.params.accountId, refreshUrl, returnUrl)).url;
  }

  /**
   * Get the webhook from stripe and handle deciding on type of event
   * @description If handlers can be used for connect and master account - wrap it in handlers callbacks
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string,
    webhookKey: string,
    webhookType: string,
  ): Promise<void> {
    const event = this.sdk.webhooks.constructEvent(payload, signature, webhookKey);

    try {
      await this.processWebhookEvent(event, webhookType);
    } catch (error) {
      const errorMessage = `Failed to process webhook. Event type: "${
        event.type
      }", webhook type: "${webhookType}". ${error.message as string} `;

      Log.error(errorMessage);

      // Throw error for Stripe webhook retry
      throw new Error(errorMessage);
    }
  }

  /**
   * Process webhook event
   */
  private async processWebhookEvent(event: StripeSdk.Event, webhookType: string): Promise<void> {
    const webhookHandlers = WebhookHandlers.init(this.manager);

    switch (event.type) {
      /**
       * Checkout session events
       */
      case 'checkout.session.completed': {
        await this.handleTransactionCompleted(event);
        break;
      }

      /**
       * Account events
       */
      case 'account.updated': {
        const handlers = {
          connect: () => webhookHandlers.account.handleAccountUpdated(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'account.external_account.created': {
        const handlers = {
          connect: () => this.handleExternalAccountCreated(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'account.external_account.updated': {
        const handlers = {
          connect: () => this.handleExternalAccountUpdated(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'account.external_account.deleted': {
        const handlers = {
          connect: () => this.handleExternalAccountDeleted(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Payment method events
       */
      case 'setup_intent.succeeded': {
        const handlers = {
          account: () => webhookHandlers.setupIntent.handleSetupIntentSucceed(event, this.sdk),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'payment_method.updated':
      case 'payment_method.automatically_updated': {
        const handlers = {
          account: () => webhookHandlers.paymentMethod.handlePaymentMethodUpdated(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'payment_method.detached': {
        const handlers = {
          account: () => webhookHandlers.paymentMethod.handlePaymentMethodDetached(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Transfer events
       */
      case 'transfer.reversed': {
        const handlers = {
          account: () => webhookHandlers.transfer.transferReversed(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Payment intent events
       */
      case 'payment_intent.processing':
      case 'payment_intent.succeeded':
      case 'payment_intent.canceled': {
        const handlers = {
          account: () => webhookHandlers.paymentIntent.handlePaymentIntent(event, this.sdk),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'payment_intent.payment_failed': {
        const handlers = {
          account: () =>
            webhookHandlers.paymentIntent.handlePaymentIntentPaymentFailed(event, this.sdk),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Application fee events
       */
      case 'application_fee.refund.updated': {
        const handlers = {
          account: () =>
            webhookHandlers.applicationFee.handleApplicationFeeRefundUpdated(event, this.sdk),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'application_fee.refunded': {
        const handlers = {
          account: () => webhookHandlers.applicationFee.handleApplicationFeeRefunded(event),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Refund events
       */
      case 'charge.refund.updated': {
        const handlers = {
          account: () => webhookHandlers.charge.handleRefundUpdated(event, this.manager),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Charge events
       */
      case 'charge.refunded': {
        const handlers = {
          account: () => webhookHandlers.charge.handleChargeRefunded(event, this.manager),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'charge.dispute.created': {
        const handlers = {
          account: () => webhookHandlers.charge.handleChargeDisputeCreated(event, this.manager),
        };

        await handlers?.[webhookType]();
        break;
      }

      case 'charge.dispute.updated':
      case 'charge.dispute.closed':
      case 'charge.dispute.funds_reinstated': {
        const handlers = {
          account: () => webhookHandlers.charge.handleChargeDisputeUpdated(event, this.manager),
        };

        await handlers?.[webhookType]();
        break;
      }

      /**
       * Customer events
       */
      case 'customer.updated': {
        const handlers = {
          account: () => webhookHandlers.customer.handleCustomerUpdated(event, this.manager),
        };

        await handlers?.[webhookType]();
        break;
      }
    }
  }

  /**
   * Create instant payout
   * @description Should be called from the API
   */
  public async instantPayout({
    userId,
    amount,
    payoutMethod,
    currency = 'usd',
  }: IInstantPayoutParams): Promise<boolean> {
    const unitAmount = this.toSmallestCurrencyUnit(amount);

    /**
     * Get related customer
     */
    const customer = await this.customerRepository.findOne({
      userId,
    });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have related connect account",
      });
    }

    if (!customer.params.isPayoutEnabled) {
      throw new BaseException({
        status: 400,
        message: "Payout isn't available",
      });
    }

    const { instant_available: instantBalance } = await this.sdk.balance.retrieve({
      stripeAccount: customer.params.accountId,
    });

    if (!instantBalance) {
      throw new BaseException({
        status: 500,
        message: "Instant balance isn't available",
      });
    }

    const balance = composeBalance(instantBalance);

    if (!balance?.[currency]) {
      throw new BaseException({
        status: 400,
        message: `Balance with the ${currency} isn't available`,
      });
    }

    if (balance?.[currency] < unitAmount) {
      throw new BaseException({
        status: 400,
        message: `Insufficient funds. Instant balance is ${balance?.[currency]} in ${currency}`,
      });
    }

    const payoutMethodData = await this.getPayoutMethodData(payoutMethod);

    if (!payoutMethodData?.isInstantPayoutAllow) {
      throw new BaseException({
        status: 400,
        message: "Provided payout method isn't support instant payout",
      });
    }

    await this.sdk.payouts.create(
      {
        currency,
        amount: unitAmount,
        method: 'instant',
        ...(payoutMethodData ? { destination: payoutMethodData.id } : {}),
      },
      { stripeAccount: customer.params.accountId },
    );

    return true;
  }

  /**
   * Returns user related connect account balance
   */
  public async getBalance(userId: string): Promise<TCustomerBalance> {
    const customer = await this.customerRepository.findOne({
      userId,
    });

    if (!customer) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    if (!customer.params.accountId) {
      throw new BaseException({
        status: 400,
        message: "Customer don't have related connect account",
      });
    }

    const {
      available,
      pending,
      instant_available: instant = [],
    } = await this.sdk.balance.retrieve({
      stripeAccount: customer.params.accountId,
    });

    return {
      available: composeBalance(available),
      instant: composeBalance(instant),
      pending: composeBalance(pending),
    };
  }

  /**
   * Handles connect account update
   * @description Connect account event
   */
  public async handleExternalAccountUpdated(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const card = await this.getCardById(externalAccount.id);

      if (!card) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Failed to handle external account updated. Card'),
        });
      }

      const {
        last4: lastDigits,
        brand,
        exp_year,
        exp_month,
        default_for_currency: isDefault,
        available_payout_methods: availablePayoutMethods,
        funding,
        issuer,
        country,
        address_country: billingCountry,
        address_zip: billingPostalCode,
      } = externalAccount;

      card.isDefault = Boolean(isDefault);
      card.lastDigits = lastDigits;
      card.expired = toExpirationDate(exp_month, exp_year);
      card.brand = brand;
      card.funding = funding;
      card.origin = country;
      card.params.issuer = issuer;
      card.country = billingCountry;
      card.postalCode = billingPostalCode;
      card.isInstantPayoutAllowed = this.isAllowedInstantPayout(availablePayoutMethods);

      await this.cardRepository.save(card);

      return;
    }

    const bankAccount = await this.getBankAccountById(externalAccount.id);

    if (!bankAccount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to handle external account updated. Bank account',
        ),
      });
    }

    const {
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    bankAccount.isDefault = Boolean(isDefault);
    bankAccount.lastDigits = lastDigits;
    bankAccount.holderName = holderName;
    bankAccount.bankName = bankName;
    bankAccount.isInstantPayoutAllowed = this.isAllowedInstantPayout(availablePayoutMethods);

    await this.bankAccountRepository.save(bankAccount);
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account create
   * @description NOTES: Connect account event
   */
  public async handleExternalAccountCreated(event: StripeSdk.Event): Promise<void> {
    /* eslint-disable camelcase */
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'The connected account reference in external account data',
        ),
      });
    }

    const { userId, params } = await CustomerRepository.getCustomerByAccountId(
      this.extractId(externalAccount.account),
      this.manager,
    );

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const {
        id: cardId,
        last4: lastDigits,
        brand,
        funding,
        exp_year,
        exp_month,
        available_payout_methods: availablePayoutMethods,
        default_for_currency: isDefault,
        address_zip: billingPostalCode,
        address_country: billingCountry,
        fingerprint,
        issuer,
        country,
      } = externalAccount;

      /**
       * Only connected custom account can attach few external account for payouts
       */
      if (params.accountType === 'custom') {
        // User SHOULD NOT be eligible in any way to attach same card as payout method
        const { isExist, type } = await CardRepository.getCardDataByFingerprint({
          userId,
          fingerprint,
        });

        if (isExist && type === 'externalAccount') {
          /**
           * @TODO: Handle for custom account duplicated card attach. Throw error and delete card from Stripe, etc..
           */
          const message = 'External account attached card is duplicated.';

          Log.error(message);
        }
      }

      await this.cardRepository.save({
        lastDigits,
        brand,
        funding,
        userId,
        origin: country,
        ...(fingerprint ? { fingerprint } : {}),
        isInstantPayoutAllowed: this.isAllowedInstantPayout(availablePayoutMethods),
        ...(billingCountry ? { country: billingCountry } : {}),
        ...(billingPostalCode ? { postalCode: billingPostalCode } : {}),
        isDefault: Boolean(isDefault),
        expired: toExpirationDate(exp_month, exp_year),
        params: { cardId, issuer },
      });

      return;
    }

    const {
      id: bankAccountId,
      last4: lastDigits,
      account_holder_name: holderName,
      bank_name: bankName,
      default_for_currency: isDefault,
      available_payout_methods: availablePayoutMethods,
    } = externalAccount as StripeSdk.BankAccount;

    await this.bankAccountRepository.save({
      isDefault: Boolean(isDefault),
      bankAccountId,
      lastDigits,
      userId,
      isInstantPayoutAllowed: this.isAllowedInstantPayout(availablePayoutMethods),
      holderName,
      bankName,
      params: { bankAccountId },
    });
    /* eslint-enable camelcase */
  }

  /**
   * Handles connect account deleted
   * @description Connect account event
   */
  public async handleExternalAccountDeleted(event: StripeSdk.Event): Promise<void> {
    const externalAccount = event.data.object as StripeSdk.Card | StripeSdk.BankAccount;

    if (!externalAccount?.account) {
      throw new BaseException({
        status: 500,
        message: 'The connected account reference in external account data not found.',
      });
    }

    const externalAccountId = this.extractId(externalAccount.id);

    if (!this.isExternalAccountIsBankAccount(externalAccount)) {
      const card = await this.getCardById(externalAccountId);

      if (!card) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Failed to handle external account deleted. Card'),
        });
      }

      await this.cardRepository.remove(card);

      return;
    }

    const bankAccount = await this.getBankAccountById(externalAccountId);

    if (!bankAccount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to handle external account deleted. Bank account',
        ),
      });
    }

    await this.bankAccountRepository.remove(bankAccount);
  }

  /**
   * Handles completing of transaction inside stripe payment process
   */
  public async handleTransactionCompleted(event: StripeSdk.Event): Promise<Transaction | void> {
    const {
      id,
      payment_status: paymentStatus,
      status,
      amount_total: amountTotal,
    } = event.data.object as ICheckoutEvent;

    const transaction = await this.transactionRepository.findOne({ transactionId: id });

    if (!transaction) {
      Log.error(`There is no actual transfer for entity with following  transaction id: ${id}`);
    }

    await this.transactionRepository.update(
      { transactionId: id },
      {
        status: Parser.parseStripeTransactionStatus(paymentStatus as StripeTransactionStatus),
        amount: amountTotal,
        params: {
          checkoutStatus: status as StripeCheckoutStatus,
          paymentStatus: paymentStatus as StripeTransactionStatus,
        },
      },
    );

    void Microservice.eventPublish(Event.EntityPaid, {
      entityId: transaction?.entityId,
      userId: transaction?.userId,
    });
  }

  /**
   * Create transfer for connected account
   */
  public async createTransfer(
    entityId: string,
    userId: string,
    payoutCoeff: number,
  ): Promise<void> {
    const transfer = await this.getTransferInfo(entityId, userId);
    const product = await this.productRepository.findOne({ entityId });

    if (!transfer || !product) {
      Log.error(
        `There is no actual transfers or product for entity with following id: ${entityId}`,
      );

      return;
    }

    const { id } = await this.sdk.transfers.create({
      amount: Math.ceil(transfer.amount * payoutCoeff),
      currency: 'usd',
      destination: transfer.destinationUser,
    });

    const transaction = this.transactionRepository.create({
      transactionId: id,
      userId: transfer.userId,
      entityId,
      amount: Math.ceil(transfer.amount * payoutCoeff),
      type: TransactionType.DEBIT,
      status: TransactionStatus.INITIAL,
      product: {
        productId: product.productId,
      },
    });

    await this.transactionRepository.save(transaction);
  }

  /**
   * Attach to transactions charge refs (transfer, destination payment and related amounts)
   */
  public async attachToTransactionsChargeRefs(chargeId: string): Promise<void> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('t')
      .where('t.chargeId = :chargeId', { chargeId })
      .getMany();

    if (!transactions.length) {
      const errorMessage = messages.getNotFoundMessage(
        'Failed to get charge regs. Debit or credit transaction',
      );

      Log.error(errorMessage);

      throw new BaseException({
        status: 500,
        message: errorMessage,
        payload: {
          transactions: transactions.map(({ transactionId, type, id }) => ({
            transactionId,
            type,
            id,
          })),
        },
      });
    }

    /**
     * Get transfer and application fees
     * @description Transfer only for destination charges.
     * The reason for managing application fees here is that when an application fee is created,
     * Stripe sends an event in parallel with the creation of the payment intent. Currently,
     * the database does not support transactions at this moment.
     */
    const { transfer, application_fee: applicationFee } = await this.sdk.charges.retrieve(
      chargeId,
      {
        expand: ['application_fee'],
      },
    );

    const isApplicationFeeExpanded = this.checkIfApplicationFeeIsObject(applicationFee);

    if (!isApplicationFeeExpanded) {
      const errorMessage = 'Failed to expand charge application fee';

      Log.error(errorMessage);

      throw new BaseException({
        status: 500,
        message: errorMessage,
        payload: { applicationFee },
      });
    }

    const {
      id: applicationFeeId,
      amount: applicationFeeAmount,
      amount_refunded: applicationFeeRefundedAmount,
    } = applicationFee;

    if (transactions.some(({ fee }) => fee !== applicationFeeAmount)) {
      const errorMessage =
        'Failed to update transaction application fee. Application fee do not equal to transaction fee';

      Log.error(errorMessage);

      throw new BaseException({
        status: 500,
        message: errorMessage,
        payload: {
          applicationFeeAmount,
          transactionsFee: JSON.stringify(transactions.map(({ fee }) => ({ fee }))),
        },
      });
    }

    const transferId: string | null = transfer ? this.extractId(transfer) : null;
    const isDestinationTransaction = transactions.some(
      ({ params }) => params.transferDestinationConnectAccountId,
    );
    const destinationTransactionErrorMessage = messages.getNotFoundMessage(
      'Failed to retrieve charge transfer destination transaction',
    );
    let transferExpanded: StripeSdk.Transfer | null = null;

    /**
     * If transaction is destination and transfer was not retrieved
     */
    if (isDestinationTransaction && !transferId) {
      Log.error(destinationTransactionErrorMessage);

      throw new BaseException({
        status: 500,
        message: destinationTransactionErrorMessage,
      });
    }

    /**
     * Get destination transaction
     * @description Only for destination charges (e.g. destination payment intent)
     */
    if (transferId) {
      transferExpanded = await this.sdk.transfers.retrieve(transferId);

      if (!transferExpanded?.destination_payment) {
        Log.error(destinationTransactionErrorMessage);

        throw new BaseException({
          status: 500,
          message: destinationTransactionErrorMessage,
        });
      }
    }

    const destinationTransaction: string | null =
      transferId && transferExpanded ? this.extractId(transferExpanded) : null;

    transactions.forEach((transaction) => {
      transaction.applicationFeeId = applicationFeeId;
      transaction.params.transferId = transferId;
      transaction.params.refundedApplicationFeeAmount = applicationFeeRefundedAmount;

      if (destinationTransaction) {
        transaction.params.destinationTransactionId = this.extractId(destinationTransaction);
        transaction.params.transferAmount = transferExpanded?.amount || 0;
        transaction.params.transferReversedAmount = transferExpanded?.amount_reversed || 0;
      }
    });

    await this.transactionRepository.save(transactions);
  }

  /**
   * Create PaymentIntent
   */
  public async createPaymentIntent({
    userId,
    entityCost,
    receiverId,
    cardId,
    title,
    applicationPaymentPercent,
    entityId,
    additionalFeesPercent,
    extraReceiverRevenuePercent,
    feesPayer = TransactionRole.SENDER,
    withTax,
  }: IPaymentIntentParams): Promise<[Transaction, Transaction]> {
    const { fees } = await remoteConfig();
    const { instantPayoutPercent = 1 } = fees as IFees;

    const { sender: senderCustomer, receiver: receiverCustomer } =
      await this.getAndValidateTransactionContributors(userId, receiverId);

    /**
     * Verify if customer is verified
     */
    const {
      userId: receiverUserId,
      params: { accountId: receiverAccountId },
    } = receiverCustomer;

    const chargeCard = await this.getChargingCard(senderCustomer.userId, cardId);

    const paymentMethodId = CardRepository.extractPaymentMethodId(chargeCard);

    if (!paymentMethodId) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Payment intent creation is failed. Payment method'),
      });
    }

    const { id: paymentMethodCardId } = chargeCard;

    /**
     * Get parsed entity cost
     */
    const entityUnitCost = this.toSmallestCurrencyUnit(entityCost);

    /**
     * Calculate fees
     */
    const {
      userUnitAmount,
      receiverUnitRevenue,
      platformUnitFee,
      stripeUnitFee: paymentIntentStripeFeeUnit,
      receiverAdditionalFee,
      extraReceiverUnitRevenue,
      senderAdditionalFee,
    } = await this.getPaymentIntentFees({
      entityUnitCost,
      applicationPaymentPercent,
      feesPayer,
      additionalFeesPercent,
      extraReceiverRevenuePercent,
      // If with tax - do not include Stripe transaction fee
      withStripeFee: !withTax,
    });

    /**
     * Group up payment intent data
     */
    let tax: ITax | null = null;
    let taxFeeUnit = 0;
    let stripeFeeUnit: number | null;
    let paymentIntentAmountUnit: number | null;
    let taxAutoCalculateFeeUnit: number | null = null;

    if (withTax) {
      if (!entityId) {
        throw new BaseException({
          status: 400,
          message: 'Entity reference is required for tax calculation.',
        });
      }

      const {
        tax: taxData,
        createTaxTransactionFeeUnit: taxFeeData,
        autoCalculateFeeUnit,
      } = await Calculation.getPaymentIntentTax(this.sdk, {
        entityId,
        processingTransactionAmountUnit: userUnitAmount,
        paymentMethodId,
        feesPayer,
      });

      taxAutoCalculateFeeUnit = autoCalculateFeeUnit;
      tax = taxData;
      // Included in transaction tax fee unit that will be covered by fees payer
      taxFeeUnit = taxFeeData;

      const { stripeFeeUnit: transactionFeeUnit, processingAmountUnit } =
        await Calculation.getStripeFeeAndProcessingAmount({
          amountUnit: taxData?.transactionAmountWithTaxUnit,
          feesPayer,
        });

      stripeFeeUnit = transactionFeeUnit;
      paymentIntentAmountUnit = processingAmountUnit;
    } else {
      stripeFeeUnit = paymentIntentStripeFeeUnit;
      paymentIntentAmountUnit = userUnitAmount;
    }

    /**
     * Prevent type error cause on payment intent metadata and transaction params
     */
    const sharedTaxData = {
      taxCreatedAt: tax?.createdAt?.toISOString(),
      taxExpiresAt: tax?.expiresAt?.toISOString(),
      taxBehaviour: tax?.behaviour,
      totalTaxPercent: tax?.totalTaxPercent,
    };

    const baseFeeUnit = platformUnitFee + stripeFeeUnit + taxFeeUnit;
    const senderPersonalFeeUnit = baseFeeUnit + senderAdditionalFee;
    const receiverPersonalFeeUnit = baseFeeUnit + receiverAdditionalFee;
    const collectedFeeUnit =
      baseFeeUnit + senderAdditionalFee + receiverAdditionalFee + (tax?.totalAmountUnit || 0);

    /* eslint-disable camelcase */
    const stripePaymentIntent: StripeSdk.PaymentIntent = await this.sdk.paymentIntents.create({
      ...(title ? { description: title } : {}),
      metadata: {
        // Original float entity cost
        entityCost,
        stripeFee: this.fromSmallestCurrencyUnit(stripeFeeUnit),
        platformFee: this.fromSmallestCurrencyUnit(platformUnitFee),
        receiverExtraFee: this.fromSmallestCurrencyUnit(receiverAdditionalFee),
        senderExtraFee: this.fromSmallestCurrencyUnit(senderAdditionalFee),
        receiverExtraRevenue: this.fromSmallestCurrencyUnit(extraReceiverUnitRevenue),
        cardId: paymentMethodCardId,
        fee: this.fromSmallestCurrencyUnit(collectedFeeUnit),
        feesPayer,
        receiverRevenue: this.fromSmallestCurrencyUnit(receiverUnitRevenue),
        baseFee: this.fromSmallestCurrencyUnit(baseFeeUnit),
        senderPersonalFee: this.fromSmallestCurrencyUnit(senderPersonalFeeUnit),
        receiverPersonalFee: this.fromSmallestCurrencyUnit(receiverPersonalFeeUnit),
        senderId: senderCustomer.userId,
        receiverId: receiverUserId,
        ...(entityId ? { entityId } : {}),
        ...(title ? { description: title } : {}),
        ...(tax?.id ? { taxCalculationId: tax?.id } : {}),
        ...(Object.keys(sharedTaxData).length !== 0 ? { ...sharedTaxData } : {}),
        ...(taxAutoCalculateFeeUnit
          ? { taxAutoCalculateFee: this.fromSmallestCurrencyUnit(taxAutoCalculateFeeUnit) }
          : {}),
        ...(taxFeeUnit ? { taxFee: this.fromSmallestCurrencyUnit(taxFeeUnit) } : {}),
        ...(tax?.transactionAmountWithTaxUnit
          ? {
              taxTransactionAmountWithTax: this.fromSmallestCurrencyUnit(
                tax?.transactionAmountWithTaxUnit,
              ),
            }
          : {}),
        ...(tax?.totalAmountUnit
          ? { taxTotalAmount: this.fromSmallestCurrencyUnit(tax?.totalAmountUnit) }
          : {}),
      },
      payment_method_types: [StripePaymentMethods.CARD],
      confirm: true,
      currency: 'usd',
      capture_method: 'automatic',
      payment_method: paymentMethodId,
      customer: senderCustomer.customerId,
      // How much must sender must pay
      amount: paymentIntentAmountUnit,
      // How much application will collect fee
      application_fee_amount: paymentIntentAmountUnit - receiverUnitRevenue,
      transfer_data: {
        destination: receiverAccountId!,
      },
    });

    const transactionData = {
      entityId,
      title,
      paymentMethodId,
      cardId: paymentMethodCardId,
      transactionId: stripePaymentIntent.id,
      fee: collectedFeeUnit,
      ...(tax ? { tax: tax.totalAmountUnit, taxCalculationId: tax.id } : {}),
      params: {
        // Handle override initial params from repository create
        ...defaultTransactionParams,
        feesPayer,
        platformFee: platformUnitFee,
        stripeFee: stripeFeeUnit,
        entityCost: entityUnitCost,
        baseFee: baseFeeUnit,
        ...(Object.keys(sharedTaxData).length !== 0 ? { ...sharedTaxData } : {}),
        ...(taxAutoCalculateFeeUnit ? { taxAutoCalculateFee: taxAutoCalculateFeeUnit } : {}),
        ...(taxFeeUnit ? { taxFee: taxFeeUnit } : {}),
        taxTransactionAmountWithTaxUnit: tax?.transactionAmountWithTaxUnit,
        taxTotalAmountUnit: tax?.totalAmountUnit,
      },
    };

    const transactions = await Promise.all([
      this.transactionRepository.save(
        this.transactionRepository.create({
          ...transactionData,
          userId: senderCustomer.userId,
          type: TransactionType.CREDIT,
          amount: paymentIntentAmountUnit,
          params: {
            ...transactionData.params,
            extraFee: senderAdditionalFee,
            personalFee: senderPersonalFeeUnit,
          },
        }),
      ),
      this.transactionRepository.save(
        this.transactionRepository.create({
          ...transactionData,
          userId: receiverUserId,
          type: TransactionType.DEBIT,
          amount: receiverUnitRevenue,
          // Amount that will be charge for instant payout
          params: {
            ...transactionData.params,
            extraFee: receiverAdditionalFee,
            personalFee: receiverPersonalFeeUnit,
            extraRevenue: extraReceiverUnitRevenue,
            estimatedInstantPayoutFee: Math.round(
              receiverUnitRevenue * (instantPayoutPercent / 100),
            ),
          },
        }),
      ),
    ]);

    /**
     * Sync payment intent with the microservice transactions
     */
    void this.sdk.paymentIntents.update(stripePaymentIntent.id, {
      metadata: {
        creditTransactionId: transactions?.[0]?.id,
        debitTransactionId: transactions?.[1]?.id,
      },
    });

    return transactions;
  }

  /**
   * Refund transaction (payment intent)
   * @description Workflow:
   * Sender payed 106.39$: 100$ - entity cost, 3.39$ - stripe fees, 3$ - platform application fee.
   * In the end of refund sender will receive 100$ and platform revenue will be 3$.
   */
  public async refund({
    transactionId,
    amount,
    entityId,
    refundAmountType = RefundAmountType.REVENUE,
    type,
  }: IRefundParams): Promise<Refund> {
    const debitTransaction = await this.transactionRepository.findOne({
      transactionId,
      type: TransactionType.DEBIT,
    });

    if (!debitTransaction) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Transaction'),
      });
    }

    if (!debitTransaction.chargeId) {
      throw new BaseException({
        status: 400,
        message: "Transaction don't have related transfer id and can't be refunded.",
      });
    }

    let amountUnit: number | undefined;

    if (amount) {
      amountUnit = this.toSmallestCurrencyUnit(amount);
    } else if (refundAmountType === RefundAmountType.REVENUE) {
      amountUnit = debitTransaction.amount;
    } else {
      amountUnit =
        // Paid entity cost - already refunded amount
        (debitTransaction.params.entityCost || 0) -
        (debitTransaction.params.refundedTransactionAmount || 0);
    }

    if (!amountUnit) {
      throw new BaseException({
        status: 500,
        message: 'Failed to refund transaction. Invalid refund amount.',
      });
    }

    /**
     * Returns refunds from platform (application) account to sender
     */
    /* eslint-disable camelcase */
    const stripeRefund = await this.sdk.refunds.create({
      charge: debitTransaction.chargeId,
      // From receiver connected account funds will be transferred to Platform, then refund
      reverse_transfer: true,
      // Refund collected application fee, if - not: rest refund amount will be charged from receiver connected account
      refund_application_fee: false,
      amount: amountUnit,
      metadata: {
        ...(entityId ? { entityId } : {}),
        ...(refundAmountType ? { refundAmountType } : {}),
        ...(type ? { type } : {}),
      },
    });

    const refund = this.refundRepository.create({
      transactionId,
      amount: stripeRefund.amount,
      status: stripeRefund.status
        ? Parser.parseStripeRefundStatus(stripeRefund.status as StripeRefundStatus)
        : RefundStatus.INITIAL,
      ...(entityId ? { entityId } : {}),
      params: {
        refundId: stripeRefund.id,
        reason: stripeRefund.reason as string,
        errorReason: stripeRefund.failure_reason,
        refundAmountType,
        ...(type ? { type } : {}),
      },
    });

    await this.refundRepository.save(refund);

    /**
     * Sync stripe refund with the microservice refund
     */
    void this.sdk.refunds.update(stripeRefund.id, { metadata: { refundId: refund.id } });

    /* eslint-enable camelcase */
    return refund;
  }

  /**
   * Creates payout transfers for given entities
   */
  public async payout(entitiesIds: { id: string; userId: string }[]) {
    const { payoutCoeff } = await remoteConfig();

    // TODO: create mechanism to rearrange/mark payouts with errors to deal with them later
    if (!payoutCoeff) {
      Log.error('Payout coefficient is not provided');

      return false;
    }

    await Promise.allSettled(
      entitiesIds.map(({ id, userId }) => this.createTransfer(id, userId, payoutCoeff)),
    );

    return true;
  }

  /**
   * Returns positive int amount
   * @description Should return the positive integer representing how much
   * to charge in the smallest currency unit
   */
  public toSmallestCurrencyUnit(amount: number | string): number {
    /**
     * Convert the amount to a number if it's a string
     */
    const parsedAmount = typeof amount === 'string' ? Number(amount) : amount;

    return parsedAmount * 100;
  }

  /**
   * Returns float value from unit
   */
  public fromSmallestCurrencyUnit(amount: number): number {
    return amount / 100;
  }

  /**
   * Set default customer payment method
   */
  public async setDefaultCustomerPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<boolean> {
    const customer = await this.sdk.customers.update(customerId, {
      // eslint-disable-next-line camelcase
      invoice_settings: {
        // eslint-disable-next-line camelcase
        default_payment_method: paymentMethodId,
      },
    });

    return customer.invoice_settings.default_payment_method === paymentMethodId;
  }

  /**
   * Set default customer payment method
   */
  public async removeCustomerPaymentMethod(paymentMethodId: string): Promise<boolean> {
    await this.sdk.paymentMethods.detach(paymentMethodId);

    return true;
  }

  /**
   * Returns receiver payment amount
   * @description NOTES: How much end user will get after fees from transaction
   * 1. Stable unit - stable amount that payment provider charges
   * 2. Payment percent - payment provider fee percent for single transaction
   * Fees calculation:
   * 1. User pays fee
   * totalAmount = 106$, receiverReceiver = 100, taxFee = 3, platformFee = 3
   * 2. Receiver pays fees
   * totalAmount = 100$, receiverReceiver = 94, taxFee = 3, platformFee = 3
   * @TODO: Move out to calculations
   */
  public async getPaymentIntentFees({
    entityUnitCost,
    feesPayer = TransactionRole.SENDER,
    additionalFeesPercent,
    applicationPaymentPercent = 0,
    extraReceiverRevenuePercent = 0,
    shouldEstimateTax = false,
    withStripeFee = true,
  }: IGetPaymentIntentFeesParams): Promise<IPaymentIntentFees> {
    const { taxes } = await remoteConfig();

    /**
     * Calculate additional fees
     */
    const receiverAdditionalFee = getPercentFromAmount(
      entityUnitCost,
      additionalFeesPercent?.receiver,
    );
    const senderAdditionalFee = getPercentFromAmount(entityUnitCost, additionalFeesPercent?.sender);

    /**
     * Additional receiver revenue from application percent
     */
    const extraReceiverUnitRevenue = getPercentFromAmount(
      entityUnitCost,
      extraReceiverRevenuePercent,
    );

    const sharedFees = {
      extraReceiverUnitRevenue,
      senderAdditionalFee,
      receiverAdditionalFee,
      ...(shouldEstimateTax ? { estimatedTaxPercent: taxes?.defaultPercent } : {}),
    };

    /**
     * How much percent from total amount will receive end user
     */
    const platformUnitFee = getPercentFromAmount(entityUnitCost, applicationPaymentPercent);

    if (feesPayer === TransactionRole.SENDER) {
      let userTempUnitAmount = entityUnitCost + platformUnitFee + senderAdditionalFee;
      let userUnitAmount: number;
      let estimatedTaxUnit = 0;

      if (shouldEstimateTax) {
        userTempUnitAmount += taxes?.stableUnit || 0;
        estimatedTaxUnit = getPercentFromAmount(userTempUnitAmount, taxes?.defaultPercent || 0);
      }

      userTempUnitAmount += estimatedTaxUnit;

      if (withStripeFee) {
        /**
         * If tax will be calculated on top set of transaction - do not include Stripe fee
         */
        userUnitAmount = (
          await Calculation.getStripeFeeAndProcessingAmount({
            amountUnit: userTempUnitAmount,
            feesPayer: TransactionRole.SENDER,
          })
        )?.processingAmountUnit;
      } else {
        userUnitAmount = userTempUnitAmount;
      }

      return {
        ...sharedFees,
        ...(shouldEstimateTax ? { estimatedTaxUnit, taxFeeUnit: taxes?.stableUnit } : {}),
        platformUnitFee,
        userUnitAmount,
        stripeUnitFee: Math.round(userUnitAmount - userTempUnitAmount),
        receiverUnitRevenue: Math.round(
          entityUnitCost - receiverAdditionalFee + extraReceiverUnitRevenue,
        ),
      };
    }

    let stripeUnitFee = 0;

    if (withStripeFee) {
      stripeUnitFee = (
        await Calculation.getStripeFeeAndProcessingAmount({
          amountUnit: entityUnitCost,
          feesPayer: TransactionRole.RECEIVER,
        })
      )?.stripeFeeUnit;
    }

    let userUnitAmount = Math.round(entityUnitCost + senderAdditionalFee);
    let estimatedTaxUnit = 0;

    if (shouldEstimateTax) {
      userUnitAmount += taxes?.stableUnit || 0;
      estimatedTaxUnit = getPercentFromAmount(userUnitAmount, taxes?.defaultPercent || 0);
    }

    userUnitAmount += estimatedTaxUnit;

    const receiverUnitRevenue = Math.round(
      entityUnitCost -
        stripeUnitFee -
        platformUnitFee -
        receiverAdditionalFee +
        extraReceiverUnitRevenue,
    );

    return {
      ...sharedFees,
      ...(shouldEstimateTax ? { estimatedTaxUnit, taxFeeUnit: taxes?.stableUnit } : {}),
      platformUnitFee,
      stripeUnitFee,
      userUnitAmount,
      receiverUnitRevenue,
    };
  }

  /**
   * Create stripe promo code
   */
  public async createPromoCode({
    couponId,
    code: userCode,
    maxRedemptions,
  }: IStripePromoCodeParams): Promise<{
    id: string;
    code: string;
  }> {
    const { id, code } = await this.sdk.promotionCodes.create({
      coupon: couponId,
      code: userCode,
      // eslint-disable-next-line camelcase
      max_redemptions: maxRedemptions,
    });

    return {
      id,
      code,
    };
  }

  /**
   * Remove stripe coupon
   */
  public async removeCoupon(couponId: string): Promise<boolean> {
    const { deleted: isDeleted } = await this.sdk.coupons.del(couponId);

    return isDeleted;
  }

  /**
   * Create stripe coupon
   */
  public async createCoupon({
    userId,
    name,
    currency,
    products,
    percentOff,
    amountOff,
    maxRedemptions,
    duration,
    durationInMonths,
  }: IStripeCouponParams): Promise<Coupon> {
    const couponDiscount = this.validateAndTransformCouponDiscountInput({ percentOff, amountOff });
    const couponDuration = this.validateAndTransformCouponDurationInput({
      duration,
      durationInMonths,
    });

    const { id } = await this.sdk.coupons.create({
      name,
      currency: currency || 'usd',
      ...couponDiscount,
      ...couponDuration,
      // eslint-disable-next-line camelcase
      applies_to: {
        products,
      },
    });

    return super.createCoupon(
      {
        userId,
        name,
        products,
        percentOff,
        amountOff,
        maxRedemptions,
        duration,
        durationInMonths,
      },
      id,
    );
  }

  /**
   * Validate and transform coupon discount input
   */
  private validateAndTransformCouponDiscountInput({
    percentOff,
    amountOff,
  }: Pick<IStripeCouponParams, 'percentOff' | 'amountOff'>): Pick<
    StripeSdk.CouponCreateParams,
    'amount_off' | 'percent_off'
  > {
    if (!amountOff && !percentOff) {
      throw new BaseException({
        status: 400,
        message: 'Neither discount amount nor percent provided.',
      });
    }

    if (amountOff && percentOff) {
      throw new BaseException({
        status: 400,
        message: 'Cannot provide both amount and percent discount.',
      });
    }

    return {
      // eslint-disable-next-line camelcase
      amount_off: amountOff,
      // eslint-disable-next-line camelcase
      percent_off: percentOff,
    };
  }

  /**
   * Validate and transform coupon duration input
   */
  private validateAndTransformCouponDurationInput({
    duration,
    durationInMonths,
  }: Pick<IStripeCouponParams, 'duration' | 'durationInMonths'>): Pick<
    StripeSdk.CouponCreateParams,
    'duration' | 'duration_in_months'
  > {
    {
      if (duration === CouponDuration.REPEATING && !durationInMonths) {
        throw new BaseException({
          status: 400,
          message: 'If duration is repeating, the number of months the coupon applies.',
        });
      }
    }

    return {
      duration: duration as StripeSdk.CouponCreateParams.Duration,
      // eslint-disable-next-line camelcase
      duration_in_months: durationInMonths,
    };
  }

  /**
   * Get and calculate transfer information
   */
  protected async getTransferInfo(
    entityId: string,
    userId: string,
  ): Promise<ITransferInfo | undefined> {
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
   * Check if external account is bank account
   */
  private isExternalAccountIsBankAccount(
    externalAccount: StripeSdk.BankAccount | StripeSdk.Card,
  ): externalAccount is StripeSdk.BankAccount {
    return externalAccount.object.startsWith('ba');
  }

  /**
   * Returns id or extracted id from data
   * @TODO: remove and use helper: extract id from stripe instance
   */
  private extractId<T extends { id: string }>(data: string | T): string {
    return typeof data === 'string' ? data : data.id;
  }

  /**
   * Returns card for charging payment
   */
  private async getChargingCard(userId: string, cardId?: string): Promise<Card> {
    let card: Card | undefined;

    /**
     * Find card that declared as the payment method
     */
    const cardQuery = this.cardRepository
      .createQueryBuilder('card')
      .where('card.userId = :userId', { userId })
      .andWhere(
        `(card.params ->> 'paymentMethodId' IS NOT NULL OR card."paymentMethodId" IS NOT NULL)`,
      );

    if (cardId) {
      card = await cardQuery.andWhere('card.id = :cardId', { cardId }).getOne();
    } else {
      card = await cardQuery.andWhere('card.isDefault = true').getOne();
    }

    if (!card) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Failed to get charging card. Card'),
      });
    }

    if (!CardRepository.extractPaymentMethodId(card)) {
      throw new BaseException({
        status: 400,
        message: "Amount can't be charged from this card. Card isn't specified is payment method.",
      });
    }

    if (card.params.cardId) {
      throw new BaseException({
        status: 400,
        message: "Amount can't be charged from this card. Card is related to the connect account.",
      });
    }

    return card;
  }

  /**
   * Returns card by card id
   * @description Uses to search related connect account (external account) data
   */
  private getCardById(cardId: string): Promise<Card | undefined> {
    return this.cardRepository
      .createQueryBuilder('card')
      .where("card.params ->> 'cardId' = :cardId", { cardId })
      .getOne();
  }

  /**
   * Returns bank account by bank account id
   * @description Uses to search related connect account (external account) data
   */
  private getBankAccountById(bankAccountId: string): Promise<BankAccount | undefined> {
    return this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .where("bankAccount.params ->> 'bankAccountId' = :bankAccountId", { bankAccountId })
      .getOne();
  }

  /**
   * Returns account link
   */
  private buildAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<StripeSdk.AccountLink> {
    return this.sdk.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      // eslint-disable-next-line camelcase
      refresh_url: refreshUrl,
      // eslint-disable-next-line camelcase
      return_url: returnUrl,
    });
  }

  /**
   * Check is allowed instant payout
   */
  private isAllowedInstantPayout(availablePayoutMethods?: TAvailablePaymentMethods): boolean {
    if (!availablePayoutMethods) {
      return false;
    }

    return availablePayoutMethods.includes('instant');
  }

  /**
   * Returns payout method data
   */
  private async getPayoutMethodData(
    payoutMethod?: IPayoutMethod,
  ): Promise<{ id?: string; isInstantPayoutAllow: boolean } | undefined> {
    if (!payoutMethod) {
      return;
    }

    const { method, id } = payoutMethod;

    /**
     * @TODO: Simplify this
     */
    if (method === 'card') {
      const card = await this.cardRepository.findOne(id);

      return {
        id: card?.params?.cardId,
        isInstantPayoutAllow: Boolean(card?.isInstantPayoutAllowed),
      };
    }

    const bankAccount = await this.bankAccountRepository.findOne(id);

    return {
      id: bankAccount?.params?.bankAccountId,
      isInstantPayoutAllow: Boolean(bankAccount?.isInstantPayoutAllowed),
    };
  }

  /**
   * Build card data
   */
  private buildCardData({ cvc, expired, digits, token }: ICardParams): TCardData | undefined {
    if (token) {
      return { token };
    }

    if (!expired || !digits || !cvc) {
      return;
    }

    const { year, month } = fromExpirationDate(expired);

    return {
      // eslint-disable-next-line camelcase
      exp_month: month,
      // eslint-disable-next-line camelcase
      exp_year: year,
      cvc,
      number: digits,
    };
  }

  /**
   * Get and validate receiver and sender
   */
  private async getAndValidateTransactionContributors(
    senderId: string,
    receiverId: string,
  ): Promise<{ receiver: Customer; sender: Customer }> {
    const sender = await this.customerRepository.findOne({ userId: senderId });
    const receiver = await this.customerRepository.findOne({ userId: receiverId });

    if (!sender) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Sender customer account'),
      });
    }

    if (!receiver) {
      throw new BaseException({
        status: 400,
        message: messages.getNotFoundMessage('Receiver customer account'),
      });
    }

    const {
      params: { accountId: receiverAccountId, isVerified: isReceiverVerified },
    } = receiver;

    if (!receiverAccountId || !isReceiverVerified) {
      throw new BaseException({
        status: 400,
        message: "Receiver don't have setup or verified connected account.",
      });
    }

    return {
      sender,
      receiver,
    };
  }

  /**
   * Check if transfer is object
   */
  private checkIfApplicationFeeIsObject(
    applicationFee?: StripeSdk.ApplicationFee | string | null,
  ): applicationFee is StripeSdk.ApplicationFee {
    if (!applicationFee || typeof applicationFee === 'string') {
      return false;
    }

    return 'id' in applicationFee && applicationFee.object === 'application_fee';
  }
}

export default Stripe;
