import { Endpoint } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import ConfigRepository from '@repositories/config-repository';

/**
 * Remove config(s)
 */
const remove = Endpoint.remove(() => ({
  repository: getCustomRepository(ConfigRepository),
}));

export default remove;
