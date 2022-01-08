import type { Microservice } from '@lomray/microservice-nodejs-lib';
import ConfigCount from '@methods/config/count';
import ConfigCreate from '@methods/config/create';
import ConfigList from '@methods/config/list';
import ConfigRemove from '@methods/config/remove';
import ConfigView from '@methods/config/view';
import CrudMiddleware from '@methods/middleware/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  /**
   * Config entity CRUD methods
   * NOTE: create through separated methods just for example
   */
  ms.addEndpoint('config.count', ConfigCount, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('config.list', ConfigList, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('config.view', ConfigView, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('config.create', ConfigCreate, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('config.update', ConfigCreate, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('config.remove', ConfigRemove, { isDisableMiddlewares: true, isPrivate: true });

  /**
   * Middleware entity CRUD methods
   */
  Object.entries(CrudMiddleware).forEach(([method, handler]) => {
    ms.addEndpoint(`middleware.${method}`, handler, {
      isDisableMiddlewares: true,
      isPrivate: true,
    });
  });
};
