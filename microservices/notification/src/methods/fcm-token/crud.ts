import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import FcmToken from '@entities/fcm-token';

/**
 * CRUD controller for FCMToken entities
 */
const crud = Endpoint.controller(() => getRepository(FcmToken), {
  restore: false,
  create: false,
});

export default crud;
