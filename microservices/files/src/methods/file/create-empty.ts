import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import File from '@entities/file';

/**
 * Create empty file
 */
const create = Endpoint.create(() => ({
  repository: getRepository(File),
}));

export default create;
