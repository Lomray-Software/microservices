import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import BankAccountAdd from '@methods/bank-account/add';
import CrudBankAccount from '@methods/bank-account/crud';
import CardAdd from '@methods/card/add';
import CrudCard from '@methods/card/crud';
import CustomerCreate from '@methods/customer/create';
import CrudCustomer from '@methods/customer/crud';
import PriceCreate from '@methods/price/create';
import CrudPrice from '@methods/price/crud';
import ProductCreate from '@methods/product/create';
import CrudProduct from '@methods/product/crud';
import ConnectAccount from '@methods/stripe/connect-account';
import ConnectAccountLink from '@methods/stripe/connect-account-link';
import CreateCheckout from '@methods/stripe/create-checkout';
import CreatePaymentIntent from '@methods/stripe/create-payment-intent';
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
    transaction: CrudTransaction,
    customer: {
      ...CrudCustomer,
      create: CustomerCreate,
    },
    stripe: {
      'setup-intent': SetupIntent,
      'create-checkout': CreateCheckout,
      'connect-account': ConnectAccount,
      'create-payment-intent': CreatePaymentIntent,
      'connect-account-link': ConnectAccountLink,
      webhook: WebhookHandler,
      payout: Payout,
      refund: Refund,
    },
    product: {
      ...CrudProduct,
      create: ProductCreate,
    },
    price: {
      ...CrudPrice,
      create: PriceCreate,
    },
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
