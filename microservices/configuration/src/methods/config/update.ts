import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Update config
 */
const update = Endpoint.update(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default update;
