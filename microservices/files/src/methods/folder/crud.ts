import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Folder from '@entities/folder';

/**
 * CRUD controller for Folder entity
 */
const crud = Endpoint.controller(() => getRepository(Folder), {
  restore: false,
});

export default crud;
