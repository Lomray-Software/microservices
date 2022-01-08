import { CRUD } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Create config
 */
const create = CRUD.create(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default create;
