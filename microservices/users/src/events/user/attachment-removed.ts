import type { IEventHandler } from '@lomray/microservice-nodejs-lib';
import { getRepository } from 'typeorm';
import { msOptions } from '@config/ms';
import Profile from '@entities/profile';
import type { IAttachment } from '@interfaces/microservices/attachments/entities/attachment';

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
      ({ type, microservice }) => type === 'user' && microservice === msOptions.name,
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
