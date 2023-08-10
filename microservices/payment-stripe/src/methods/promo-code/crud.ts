import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import PromoCode from '@entities/promo-code';

/**
 * CRUD controller for Promo code entity
 */
const crud = Endpoint.controller(() => getRepository(PromoCode), {
  restore: false,
});

export default crud;
