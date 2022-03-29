import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Token from '@entities/token';

/**
 * List auth tokens
 */
const list = Endpoint.list(() => ({
  repository: getRepository(Token),
}));

export default list;
