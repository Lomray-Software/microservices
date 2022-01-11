import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Create config
 */
const create = Endpoint.create(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default create;
