import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice, IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudArticle from '@methods/article/crud';
import CrudCategory from '@methods/category/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    article: CrudArticle,
    category: CrudCategory,
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
