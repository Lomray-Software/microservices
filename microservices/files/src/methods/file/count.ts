import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import File from '@entities/file';

/**
 * Get count of files
 */
const count = Endpoint.count(() => ({
  repository: getRepository(File),
}));

export default count;
