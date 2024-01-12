import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import BankAccountAdd from '@methods/bank-account/add';
import CrudBankAccount from '@methods/bank-account/crud';
import CardAdd from '@methods/card/add';
import CrudCard from '@methods/card/crud';
import CrudCart from '@methods/cart/crud';
import CrudCartProductPrice from '@methods/cart-product-price/crud';
import CouponCreate from '@methods/coupon/create';
import CrudCoupon from '@methods/coupon/crud';
import CustomerCreate from '@methods/customer/create';
import CrudCustomer from '@methods/customer/crud';
import CustomerRemove from '@methods/customer/remove';
import CrudDispute from '@methods/dispute/crud';
import CrudEvidenceDetails from '@methods/evidence-details/crud';
import CrudPayout from '@methods/payout/crud';
import PriceCreate from '@methods/price/create';
import CrudPrice from '@methods/price/crud';
import ProductCreate from '@methods/product/create';
import CrudProduct from '@methods/product/crud';
import CrudPromoCode from '@methods/promo-code/crud';
import CrudRefund from '@methods/refund/crud';
import Balance from '@methods/stripe/balance';
import ConnectAccount from '@methods/stripe/connect-account';
import ConnectAccountLink from '@methods/stripe/connect-account-link';
import CreateCartCheckout from '@methods/stripe/create-cart-checkout';
import CreateCheckout from '@methods/stripe/create-checkout';
import CreatePaymentIntent from '@methods/stripe/create-payment-intent';
import DashboardLoginLink from '@methods/stripe/dashboard-login-link';
import InstantPayout from '@methods/stripe/instant-payout';
import PaymentIntentFees from '@methods/stripe/payment-intent-fees';
import Payout from '@methods/stripe/payout';
import Refund from '@methods/stripe/refund';
import SetupIntent from '@methods/stripe/setup-intent';
import WebhookHandler from '@methods/stripe/webhook';
import CrudTransaction from '@methods/transaction/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    card: {
      ...CrudCard,
      add: CardAdd,
    },
    'bank-account': {
      ...CrudBankAccount,
      add: BankAccountAdd,
    },
    payout: CrudPayout,
    cart: CrudCart,
    'cart-product-price': CrudCartProductPrice,
    transaction: CrudTransaction,
    refund: CrudRefund,
    customer: {
      ...CrudCustomer,
      create: CustomerCreate,
      remove: CustomerRemove,
    },
    stripe: {
      'setup-intent': SetupIntent,
      'create-checkout': CreateCheckout,
      'create-cart-checkout': CreateCartCheckout,
      'connect-account': ConnectAccount,
      'create-payment-intent': CreatePaymentIntent,
      'payment-intent-fees': PaymentIntentFees,
      'connect-account-link': ConnectAccountLink,
      'instant-payout': InstantPayout,
      'dashboard-login-link': DashboardLoginLink,
      webhook: WebhookHandler,
      payout: Payout,
      refund: Refund,
      balance: Balance,
    },
    product: {
      ...CrudProduct,
      create: ProductCreate,
    },
    price: {
      ...CrudPrice,
      create: PriceCreate,
    },
    coupon: {
      ...CrudCoupon,
      create: CouponCreate,
    },
    'promo-code': {
      ...CrudPromoCode,
    },
    dispute: CrudDispute,
    'evidence-details': CrudEvidenceDetails,
  };

  /**
   * CRUD methods
   */
  Object.entries(crud).forEach(([endpoint, crudMethods]) => {
    Object.entries<IEndpointHandler>(crudMethods).forEach(([method, handler]) => {
      ms.addEndpoint(`${endpoint}.${method}`, handler);
    });
  });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
