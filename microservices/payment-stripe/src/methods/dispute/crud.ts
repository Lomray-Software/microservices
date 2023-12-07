import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Dispute from '@entities/dispute';

/**
 * CRUD controller for Dispute entity
 */
const crud = Endpoint.controller(() => getRepository(Dispute), {
  restore: false,
});

export default crud;
