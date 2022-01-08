import { CRUD } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Count configs
 */
const count = CRUD.count(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default count;
