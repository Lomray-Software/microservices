import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Condition from '@entities/condition';

/**
 * CRUD controller for condition entity
 */
const crud = Endpoint.controller(() => getRepository(Condition), {
  restore: false,
});

export default crud;
