import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice } from '@lomray/microservice-nodejs-lib';
import { IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudCondition from '@methods/condition/crud';
import CrudEndpoint from '@methods/endpoint/crud';
import EndpointEnforce from '@methods/endpoint/enforce';
import EndpointFilter from '@methods/endpoint/filter';
import CrudEndpointFilter from '@methods/endpoint-filter/crud';
import CrudFilter from '@methods/filter/crud';
import CrudModel from '@methods/model/crud';
import CrudRole from '@methods/role/crud';
import ServiceSyncMetadata from '@methods/service/sync-metadata';
import UserRoleAssign from '@methods/user-role/assign';
import UserRoleRemove from '@methods/user-role/remove';
import UserRoleView from '@methods/user-role/view';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    role: CrudRole,
    model: CrudModel,
    filter: CrudFilter,
    endpoint: CrudEndpoint,
    condition: CrudCondition,
    'endpoint-filter': CrudEndpointFilter,
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
   * User role methods
   */
  ms.addEndpoint('user-role.assign', UserRoleAssign);
  ms.addEndpoint('user-role.remove', UserRoleRemove);
  ms.addEndpoint('user-role.view', UserRoleView);

  /**
   * Extra methods for endpoint
   */
  ms.addEndpoint('endpoint.enforce', EndpointEnforce);
  ms.addEndpoint('endpoint.filter', EndpointFilter);

  /**
   * Service methods
   */
  ms.addEndpoint('service.sync-metadata', ServiceSyncMetadata);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
