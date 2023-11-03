import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Cart from '@entities/cart';

/**
 * CRUD controller for Cart entity
 */
const crud = Endpoint.controller(() => getRepository(Cart), {
  restore: false,
});

export default crud;
