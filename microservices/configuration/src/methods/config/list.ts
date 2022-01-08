import { CRUD } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Get configs list
 */
const list = CRUD.list(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default list;
