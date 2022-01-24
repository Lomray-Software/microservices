import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Filter from '@entities/filter';

/**
 * CRUD controller for filter entity
 */
const crud = Endpoint.controller(() => getRepository(Filter), {
  restore: false,
});

export default crud;
