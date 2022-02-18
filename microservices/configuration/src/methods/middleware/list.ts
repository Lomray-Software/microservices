import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Get middleware list
 */
const list = Endpoint.list(() => ({
  repository: getRepository(Middleware),
}));

export default list;
