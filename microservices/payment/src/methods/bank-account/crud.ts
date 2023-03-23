import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import BankAccount from '@entities/bank-account';

/**
 * CRUD controller for Bank Account entity
 */
const crud = Endpoint.controller(() => getRepository(BankAccount), {
  restore: false,
});

export default crud;
