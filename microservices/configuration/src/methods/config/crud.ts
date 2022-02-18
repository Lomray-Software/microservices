import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * CRUD controller for config entity
 */
const crud = Endpoint.controller(() => getCustomRepository(ConfigRepository), {
  restore: false,
});

export default crud;
