import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import IdentityProvider from '@entities/identity-provider';

/**
 * CRUD controller for identity provider entity
 * Create method disabled: you need use some think like 'signup' for this.
 */
const crud = Endpoint.controller(() => getRepository(IdentityProvider), {
  create: false,
});

export default crud;
