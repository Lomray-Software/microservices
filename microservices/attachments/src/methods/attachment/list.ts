import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Attachment from '@entities/attachment';
import AttachmentDomain from '@services/attachment-domain';

/**
 * Get list of attachments
 */
const list = Endpoint.list(
  () => ({
    repository: getRepository(Attachment),
    description: 'Get list of attachments with domains in their url',
  }),
  async (typeQuery) => {
    const { list: attachments, count } = await Endpoint.defaultHandler.list(
      typeQuery.toQuery(),
      true,
    );

    return { list: await AttachmentDomain.addDomains(attachments), count };
  },
);

export default list;
