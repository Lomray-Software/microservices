import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import History from '@entities/history';

/**
 * CRUD controller for History entity
 */
const crud = Endpoint.controller(() => getRepository(History), {
  restore: false,
});

export default crud;
