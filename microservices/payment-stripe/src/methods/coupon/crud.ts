import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Coupon from '@entities/coupon';

/**
 * CRUD controller for Coupon entity
 */
const crud = Endpoint.controller(() => getRepository(Coupon), {
  restore: false,
  create: false,
});

export default crud;
