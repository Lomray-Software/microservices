import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import MethodFilter from '@entities/method-filter';

/**
 * CRUD controller for method filter entity
 */
const crud = Endpoint.controller(() => getRepository(MethodFilter), {
  restore: false,
});

export default crud;
