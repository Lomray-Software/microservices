import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Article from '@entities/article';

/**
 * CRUD controller for article entity
 */
const crud = Endpoint.controller(() => getRepository(Article), {
  restore: false,
});

export default crud;
