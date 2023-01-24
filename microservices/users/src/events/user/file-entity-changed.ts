import { Api } from '@lomray/microservice-helpers';
import type { IEventHandler } from '@lomray/microservice-nodejs-lib';
import type IFileEntity from '@lomray/microservices-client-api/interfaces/files/entities/file-entity';
import { getRepository } from 'typeorm';
import Event from '@constants/event';
import CONST from '@constants/index';
import Profile from '@entities/profile';

/**
 * Event handler for FileEntity from files microservice
 *
 * Listen events: create, update, remove
 *
 * Update user photo if user file changed
 */
const fileEntityChanged: IEventHandler<{ entity: IFileEntity }> = async ({
  entity,
  payload: { eventName } = {},
}) => {
  const { entityId: userId, fileId, type, microservice } = entity;

  // detect only related with user file entities
  if (type !== 'user' || microservice !== CONST.MS_NAME) {
    return false;
  }

  const repository = getRepository(Profile);

  switch (eventName) {
    case Event.FileEntityCreate:
    case Event.FileEntityUpdate:
      const { result } = await Api.get().files.file.view({
        query: { where: { id: fileId } },
      });
      const photo = result?.entity?.url;

      if (!photo) {
        return false;
      }

      await repository.update({ userId }, { photo });
      break;

    case Event.FileEntityRemove:
      await repository.update({ userId }, { photo: null });
      break;

    default:
      return false;
  }

  return true;
};

export default fileEntityChanged;
