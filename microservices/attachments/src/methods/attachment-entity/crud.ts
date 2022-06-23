import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import AttachmentEntity from '@entities/attachment-entity';

/**
 * CRUD controller for "attachment entity" entity
 */
const crud = Endpoint.controller(() => getRepository(AttachmentEntity), {
  restore: false,
  view: false,
  list: false,
});

export default crud;
