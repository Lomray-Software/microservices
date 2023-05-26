import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Transaction from '@entities/transaction';

/**
 * CRUD controller for Transaction entity
 */
const crud = Endpoint.controller(() => getRepository(Transaction), {
  restore: false,
  remove: false,
  create: false,
  update: false,
});

export default crud;
