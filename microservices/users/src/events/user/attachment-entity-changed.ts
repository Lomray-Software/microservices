import type { IEventHandler } from '@lomray/microservice-nodejs-lib';
import { getRepository } from 'typeorm';
import { msOptions } from '@config/ms';
import Event from '@constants/event';
import Profile from '@entities/profile';
import type IAttachmentEntity from '@interfaces/microservices/attachments/entities/attachment-entity';
import Api from '@services/external/api';

/**
 * Event handler for AttachmentEntity from attachments microservice
 *
 * Listen events: create, update, remove
 *
 * Update user photo if user attachment changed
 */
const attachmentEntityChanged: IEventHandler<{ entity: IAttachmentEntity }> = async ({
  entity,
  payload: { eventName } = {},
}) => {
  const { entityId: userId, attachmentId, type, microservice } = entity;

  // detect only related with user attachment entities
  if (type !== 'user' || microservice !== msOptions.name) {
    return false;
  }

  const repository = getRepository(Profile);

  switch (eventName) {
    case Event.AttachmentEntityCreate:
    case Event.AttachmentEntityUpdate:
      const response = await Api.attachments.attachment.view({
        query: { where: { id: attachmentId } },
      });
      const photo = response.getResult()?.entity?.url;

      if (!photo) {
        return false;
      }

      await repository.update({ userId }, { photo });
      break;

    case Event.AttachmentEntityRemove:
      await repository.update({ userId }, { photo: null });
      break;

    default:
      return false;
  }

  return true;
};

export default attachmentEntityChanged;
