import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Token from '@entities/token';

/**
 * Count auth token
 */
const count = Endpoint.count(() => ({
  repository: getRepository(Token),
  queryOptions: {
    isDisableAttributes: false,
  },
}));

export default count;
