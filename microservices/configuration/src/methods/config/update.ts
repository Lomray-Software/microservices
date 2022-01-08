import { CRUD } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Update config
 */
const update = CRUD.update(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default update;
