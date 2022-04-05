import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import UserRole from '@entities/user-role';

/**
 * Assign role to user
 */
const assign = Endpoint.create(() => ({
  description: 'Assign role to user',
  repository: getRepository(UserRole),
}));

export default assign;
