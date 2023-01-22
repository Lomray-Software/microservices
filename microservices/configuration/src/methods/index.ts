import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudConfig from '@methods/config/crud';
import MiddlewareCount from '@methods/middleware/count';
import MiddlewareCreate from '@methods/middleware/create';
import MiddlewareList from '@methods/middleware/list';
import MiddlewareRemove from '@methods/middleware/remove';
import MiddlewareView from '@methods/middleware/view';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  /**
   * Middleware entity CRUD methods
   */
  ms.addEndpoint('middleware.count', MiddlewareCount, {
    isDisableMiddlewares: true,
  });
  ms.addEndpoint('middleware.list', MiddlewareList, {
    isDisableMiddlewares: true,
  });
  ms.addEndpoint('middleware.view', MiddlewareView, {
    isDisableMiddlewares: true,
  });
  ms.addEndpoint('middleware.create', MiddlewareCreate, {
    isDisableMiddlewares: true,
  });
  ms.addEndpoint('middleware.update', MiddlewareCreate, {
    isDisableMiddlewares: true,
  });
  ms.addEndpoint('middleware.remove', MiddlewareRemove, {
    isDisableMiddlewares: true,
  });

  /**
   * Config entity CRUD methods
   */
  Object.entries(CrudConfig).forEach(([method, handler]) => {
    ms.addEndpoint(`config.${method}`, handler, {
      isDisableMiddlewares: true,
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
