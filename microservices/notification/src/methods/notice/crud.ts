import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Notice from '@entities/notice';

/**
 * CRUD controller for Notice entities
 */
const crud = Endpoint.controller(() => getRepository(Notice), {
  restore: false,
});

export default crud;
