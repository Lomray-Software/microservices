import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice, IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudFileEntity from '@methods/file-entity/crud';
import FileEntityList from '@methods/file-entity/list';
import FileEntityView from '@methods/file-entity/view';
import FileCount from '@methods/file/count';
import FileCreate from '@methods/file/create';
import FileCreateEmpty from '@methods/file/create-empty';
import FileList from '@methods/file/list';
import FileRemove from '@methods/file/remove';
import FileUpdate from '@methods/file/update';
import FileView from '@methods/file/view';
import CrudFolder from '@methods/folder/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    'file-entity': CrudFileEntity,
    folder: CrudFolder,
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
   * File methods
   */
  ms.addEndpoint('file.create', FileCreate);
  ms.addEndpoint('file.update', FileUpdate);
  ms.addEndpoint('file.remove', FileRemove);
  ms.addEndpoint('file.view', FileView);
  ms.addEndpoint('file.list', FileList);
  ms.addEndpoint('file.count', FileCount);
  ms.addEndpoint('file.create-empty', FileCreateEmpty);

  /**
   * file entity endpoint
   */
  ms.addEndpoint('file-entity.view', FileEntityView);
  ms.addEndpoint('file-entity.list', FileEntityList);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
