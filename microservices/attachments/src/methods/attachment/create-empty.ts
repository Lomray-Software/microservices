import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Attachment from '@entities/attachment';

/**
 * Create attachment
 */
const create = Endpoint.create(() => ({
  repository: getRepository(Attachment),
}));

export default create;
