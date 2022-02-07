import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import User from '@entities/user';

/**
 * CRUD controller for user entity
 */
const crud = Endpoint.controller(() => getRepository(User), {
  remove: { options: () => ({ isSoftDelete: true }) },
});

export default crud;
