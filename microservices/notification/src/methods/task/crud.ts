import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Task from '@entities/notice';

/**
 * CRUD controller for Task entities
 */
const crud = Endpoint.controller(() => getRepository(Task), {
  restore: false,
});

export default crud;
