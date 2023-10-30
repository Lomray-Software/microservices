import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import CartItem from '@entities/cart-item';

/**
 * CRUD controller for Cart item entity
 */
const crud = Endpoint.controller(() => getRepository(CartItem), {
  restore: false,
});

export default crud;
