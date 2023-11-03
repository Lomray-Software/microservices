import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import CartProductPrice from '@entities/cart-product-price';

/**
 * CRUD controller for Cart product price entity
 */
const crud = Endpoint.controller(() => getRepository(CartProductPrice), {
  restore: false,
});

export default crud;
