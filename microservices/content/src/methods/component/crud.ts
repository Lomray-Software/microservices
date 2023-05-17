import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Component from '@entities/component';

/**
 * CRUD controller for article entity
 */
const crud = Endpoint.controller(() => getRepository(Component), {
  restore: false,
});

export default crud;
