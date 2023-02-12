import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudConfig from '@methods/config/crud';
import MiddlewareCount from '@methods/middleware/count';
import MiddlewareCreate from '@methods/middleware/create';
import MiddlewareList from '@methods/middleware/list';
import MiddlewareRemove from '@methods/middleware/remove';
import MiddlewareUpdate from '@methods/middleware/update';
import MiddlewareView from '@methods/middleware/view';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    config: CrudConfig,
    middleware: {
      count: MiddlewareCount,
      list: MiddlewareList,
      view: MiddlewareView,
      create: MiddlewareCreate,
      update: MiddlewareUpdate,
      remove: MiddlewareRemove,
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
