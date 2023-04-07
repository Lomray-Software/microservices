import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import ConnectAccount from '@entities/connect-account';

/**
 * CRUD controller for ConnectAccount entity
 */
const crud = Endpoint.controller(() => getRepository(ConnectAccount), {
  restore: false,
  create: false,
});

export default crud;
