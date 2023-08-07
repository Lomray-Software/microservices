import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import PromoCode from '@entities/promo-code';

/**
 * CRUD controller for Product entity
 */
const crud = Endpoint.controller(() => getRepository(PromoCode), {
  restore: false,
});

export default crud;
