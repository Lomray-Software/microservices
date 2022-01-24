import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Role from '@entities/role';

/**
 * CRUD controller for role entity
 */
const crud = Endpoint.controller(() => getRepository(Role), {
  restore: false,
});

export default crud;
