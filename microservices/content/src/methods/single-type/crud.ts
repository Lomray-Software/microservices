import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import SingleType from '@entities/single-type';

/**
 * CRUD controller for single-type entity
 */
const crud = Endpoint.controller(() => getRepository(SingleType), {
  restore: false,
  view: false,
});

export default crud;
