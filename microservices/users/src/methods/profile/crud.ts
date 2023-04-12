import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Profile from '@entities/profile';

/**
 * CRUD controller for profile entity
 */
const crud = Endpoint.controller(() => getRepository(Profile), {
  remove: false,
  restore: false,
  list: false,
  count: false,
});

export default crud;
