import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Card from '@entities/card';

/**
 * CRUD controller for Card entity
 */
const crud = Endpoint.controller(() => getRepository(Card), {
  restore: false,
  remove: false,
  create: false,
  update: false,
});

export default crud;
