import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Price from '@entities/price';

/**
 * CRUD controller for Price entity
 */
const crud = Endpoint.controller(() => getRepository(Price), {
  restore: false,
  create: false,
});

export default crud;
