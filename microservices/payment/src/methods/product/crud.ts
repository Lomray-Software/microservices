import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Product from '@entities/product';

/**
 * CRUD controller for Product entity
 */
const crud = Endpoint.controller(() => getRepository(Product), {
  restore: false,
  create: false,
});

export default crud;
