import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Count middleware
 */
const count = Endpoint.count(() => ({
  repository: getRepository(Middleware),
}));

export default count;
