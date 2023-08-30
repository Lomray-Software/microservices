import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Category from '@entities/category';

/**
 * CRUD controller for article entity
 */
const crud = Endpoint.controller(() => getRepository(Category), {
  restore: false,
});

export default crud;
