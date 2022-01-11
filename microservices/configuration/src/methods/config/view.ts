import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Get config
 */
const view = Endpoint.view(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default view;
