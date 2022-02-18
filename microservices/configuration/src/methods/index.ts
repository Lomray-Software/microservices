import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CrudConfig from '@methods/config/crud';
import MetaEndpoint from '@methods/meta';
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
    isPrivate: true,
  });
  ms.addEndpoint('middleware.list', MiddlewareList, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
  ms.addEndpoint('middleware.view', MiddlewareView, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
  ms.addEndpoint('middleware.create', MiddlewareCreate, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
  ms.addEndpoint('middleware.update', MiddlewareCreate, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
  ms.addEndpoint('middleware.remove', MiddlewareRemove, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });

  /**
   * Config entity CRUD methods
   */
  Object.entries(CrudConfig).forEach(([method, handler]) => {
    ms.addEndpoint(`config.${method}`, handler, {
      isDisableMiddlewares: true,
      isPrivate: true,
    });
  });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint, { isDisableMiddlewares: true, isPrivate: true });
};
