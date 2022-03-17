import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Message from '@entities/message';

/**
 * CRUD controller for message
 */
const crud = Endpoint.controller(() => getRepository(Message), {
  create: false,
  update: false,
  remove: false,
  restore: false,
});

export default crud;
