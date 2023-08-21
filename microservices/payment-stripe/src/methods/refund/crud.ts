import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Refund from '@entities/refund';

/**
 * CRUD controller for Refund entity
 */
const crud = Endpoint.controller(() => getRepository(Refund), {
  restore: false,
  remove: false,
  create: false,
  update: false,
});

export default crud;
