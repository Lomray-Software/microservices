import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Middleware from '@entities/middleware';

/**
 * CRUD controller for middleware entity
 */
const crud = Endpoint.controller(() => getRepository(Middleware), {
  restore: false,
});

export default crud;
