import type { Microservice, IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import CrudComponent from '@methods/component/crud';
import MetaHandler from '@methods/meta';
import CrudSingleType from '@methods/single-type/crud';
import SingleTypeView from '@methods/single-type/view';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    component: CrudComponent,
    'single-type': CrudSingleType,
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
   * Single types methods
   */
  ms.addEndpoint('single-type.view', SingleTypeView);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaHandler, {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
