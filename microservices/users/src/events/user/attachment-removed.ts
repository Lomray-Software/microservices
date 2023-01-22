import type { IEventHandler } from '@lomray/microservice-nodejs-lib';
import type { IAttachment } from '@lomray/microservices-client-api/interfaces/attachments/entities/attachment';
import { getRepository } from 'typeorm';
import CONST from '@constants/index';
import Profile from '@entities/profile';

/**
 * Event handler for Attachment from attachments microservice
 *
 * Listen events: remove
 *
 * Update user photo if user attachment removed
 */
const removed: IEventHandler<{ entity: IAttachment }> = async ({ entity }) => {
  const { attachmentEntities } = entity;
  // detect only related with user attachment entities
  const usersEntities =
    attachmentEntities?.filter(
      ({ type, microservice }) => type === 'user' && microservice === CONST.MS_NAME,
    ) || [];

  if (!usersEntities.length) {
    return false;
  }

  const repository = getRepository(Profile);

  // remove photo
  await Promise.all(
    usersEntities.map(({ entityId }) => repository.update({ userId: entityId }, { photo: null })) ||
      [],
  );

  return true;
};

export default removed;
