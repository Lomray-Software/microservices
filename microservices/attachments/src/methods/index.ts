import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CrudAttachmentEntity from '@methods/attachment-entity/crud';
import AttachmentEntityList from '@methods/attachment-entity/list';
import AttachmentEntityView from '@methods/attachment-entity/view';
import AttachmentCount from '@methods/attachment/count';
import AttachmentCreate from '@methods/attachment/create';
import AttachmentCreateEmpty from '@methods/attachment/create-empty';
import AttachmentList from '@methods/attachment/list';
import AttachmentRemove from '@methods/attachment/remove';
import AttachmentUpdate from '@methods/attachment/update';
import AttachmentView from '@methods/attachment/view';
import MetaEndpoint from '@methods/meta';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    'attachment-entity': CrudAttachmentEntity,
  };

  Object.entries(crud).forEach(([endpoint, crudMethods]) => {
    Object.entries(crudMethods).forEach(([method, handler]) => {
      ms.addEndpoint(`${endpoint}.${method}`, handler);
    });
  });

  /**
   * Attachment methods
   */
  ms.addEndpoint('attachment.create', AttachmentCreate);
  ms.addEndpoint('attachment.update', AttachmentUpdate);
  ms.addEndpoint('attachment.remove', AttachmentRemove);
  ms.addEndpoint('attachment.view', AttachmentView);
  ms.addEndpoint('attachment.list', AttachmentList);
  ms.addEndpoint('attachment.count', AttachmentCount);
  ms.addEndpoint('attachment.create-empty', AttachmentCreateEmpty);

  /**
   * Attachment entity endpoint
   */
  ms.addEndpoint('attachment-entity.view', AttachmentEntityView);
  ms.addEndpoint('attachment-entity.list', AttachmentEntityList);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint, { isDisableMiddlewares: true, isPrivate: true });
};
