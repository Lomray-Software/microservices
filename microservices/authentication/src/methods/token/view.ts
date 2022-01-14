import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Token from '@entities/token';

/**
 * View auth token
 */
const view = Endpoint.view(() => ({
  repository: getRepository(Token),
}));

export default view;
