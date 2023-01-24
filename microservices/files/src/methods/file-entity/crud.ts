import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import FileEntity from '@entities/file-entity';

/**
 * CRUD controller for files entities
 */
const crud = Endpoint.controller(() => getRepository(FileEntity), {
  restore: false,
  view: false,
  list: false,
});

export default crud;
