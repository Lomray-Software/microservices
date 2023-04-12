import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import IdentityProvider from '@entities/identity-provider';

/**
 * CRUD controller for identity provider entity
 *
 * WARNING: You need to use some think like 'sign-in' or 'attach' for create identity provider.
 */
const crud = Endpoint.controller(() => getRepository(IdentityProvider));

export default crud;
