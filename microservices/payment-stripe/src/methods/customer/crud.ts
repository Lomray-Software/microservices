import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Customer from '@entities/customer';

/**
 * CRUD controller for Customer entity
 */
const crud = Endpoint.controller(() => getRepository(Customer), {
  restore: false,
  create: false,
});

export default crud;
