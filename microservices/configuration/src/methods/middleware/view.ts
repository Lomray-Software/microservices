import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * Get middleware
 */
const view = Endpoint.view(() => ({
  repository: getRepository(Middleware),
}));

export default view;
