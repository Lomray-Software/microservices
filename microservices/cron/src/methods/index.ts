import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudHistory from '@methods/history/crud';
import CrudTask from '@methods/task/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    task: CrudTask,
    history: CrudHistory,
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
