import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Model from '@entities/model';

/**
 * CRUD controller for model entity
 */
const crud = Endpoint.controller(() => getRepository(Model), {
  restore: false,
});

export default crud;
