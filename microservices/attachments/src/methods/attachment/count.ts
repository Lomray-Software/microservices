import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Attachment from '@entities/attachment';

/**
 * Get count of attachments
 */
const count = Endpoint.count(() => ({
  repository: getRepository(Attachment),
}));

export default count;
