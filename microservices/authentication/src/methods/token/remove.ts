import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Token from '@entities/token';

/**
 * Remove auth token
 */
const remove = Endpoint.remove(() => ({
  repository: getRepository(Token),
}));

export default remove;
