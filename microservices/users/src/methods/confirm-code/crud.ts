import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';

/**
 * CRUD controller for Confirm code entity
 */
const crud = Endpoint.controller(() => getRepository(ConfirmCode), {
  restore: false,
  update: false,
});

export default crud;
