import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CrudEndpointFilter from '@methods/endpoint-filter/crud';
import CrudEndpoint from '@methods/endpoint/crud';
import EndpointEnforce from '@methods/endpoint/enforce';
import EndpointFilter from '@methods/endpoint/filter';
import CrudFilter from '@methods/filter/crud';
import MetaEndpoint from '@methods/meta';
import CrudModel from '@methods/model/crud';
import CrudRole from '@methods/role/crud';
import ServiceSyncMetadata from '@methods/service/sync-metadata';
import UserRoleAssign from '@methods/user-role/assign';
import UserRoleRemove from '@methods/user-role/remove';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    role: CrudRole,
    model: CrudModel,
    filter: CrudFilter,
    endpoint: CrudEndpoint,
    'endpoint-filter': CrudEndpointFilter,
  };

  /**
   * CRUD methods
   */
  Object.entries(crud).forEach(([endpoint, crudMethods]) => {
    Object.entries(crudMethods).forEach(([method, handler]) => {
      ms.addEndpoint(`${endpoint}.${method}`, handler, { isPrivate: true });
    });
  });

  /**
   * User role methods
   */
  ms.addEndpoint('user-role.assign', UserRoleAssign, { isPrivate: true });
  ms.addEndpoint('user-role.remove', UserRoleRemove, { isPrivate: true });

  /**
   * Extra methods for endpoint
   */
  ms.addEndpoint('endpoint.enforce', EndpointEnforce, { isPrivate: true });
  ms.addEndpoint('endpoint.filter', EndpointFilter, { isPrivate: true });

  /**
   * Service methods
   */
  ms.addEndpoint('service.sync-metadata', ServiceSyncMetadata, { isPrivate: true });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint, { isDisableMiddlewares: true, isPrivate: true });
};
