import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Token from '@entities/token';

/**
 * Update token params
 */
const update = Endpoint.update(() => ({
  repository: getRepository(Token),
  description: 'Update token params',
}));

export default update;
