import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Card from '@entities/card';

/**
 * CRUD controller for Card entity
 */
const crud = Endpoint.controller(() => getRepository(Card), {
  restore: false,
});

export default crud;
