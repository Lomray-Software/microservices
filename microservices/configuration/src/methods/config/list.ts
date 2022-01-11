import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Get configs list
 */
const list = Endpoint.list(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default list;
