import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Payout from '@entities/payout';

/**
 * CRUD controller for Payout entity
 */
const crud = Endpoint.controller(() => getRepository(Payout), {
  restore: false,
  create: false,
});

export default crud;
