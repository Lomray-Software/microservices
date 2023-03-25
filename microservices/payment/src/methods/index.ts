import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import BankAccountAdd from '@methods/bank-account/add';
import CrudBankAccount from '@methods/bank-account/crud';
import CardAdd from '@methods/card/add';
import CrudCard from '@methods/card/crud';
import CustomerCreate from '@methods/customer/create';
import CrudCustomer from '@methods/customer/crud';
import CreateSetupIntent from '@methods/setup-intent/create';
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
    setupIntent: {
      create: CreateSetupIntent,
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
