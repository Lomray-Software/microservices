import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import User from '@entities/user';

/**
 * Get current user
 */
const me = Endpoint.view(() => ({
  description: 'Get current user',
  repository: getRepository(User),
}));

export default me;
