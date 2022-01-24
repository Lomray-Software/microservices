import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import UserRole from '@entities/user-role';

/**
 * Remove user role
 */
const remove = Endpoint.remove(() => ({
  repository: getRepository(UserRole),
  isAllowMultiple: false,
}));

export default remove;
