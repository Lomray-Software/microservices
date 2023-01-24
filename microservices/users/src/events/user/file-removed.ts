import type { IEventHandler } from '@lomray/microservice-nodejs-lib';
import type { IFile } from '@lomray/microservices-client-api/interfaces/files/entities/file';
import { getRepository } from 'typeorm';
import CONST from '@constants/index';
import Profile from '@entities/profile';

/**
 * Event handler for File from files microservice
 *
 * Listen events: remove
 *
 * Update user photo if user image removed
 */
const removed: IEventHandler<{ entity: IFile }> = async ({ entity }) => {
  const { fileEntities } = entity;
  // detect only related with user file entities
  const usersEntities =
    fileEntities?.filter(
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
