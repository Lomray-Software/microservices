import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Method from '@entities/method';

/**
 * CRUD controller for method entity
 */
const crud = Endpoint.controller(() => getRepository(Method), {
  restore: false,
});

export default crud;
