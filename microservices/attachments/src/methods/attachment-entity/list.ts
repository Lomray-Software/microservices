import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import AttachmentEntity from '@entities/attachment-entity';
import AttachmentDomain from '@services/attachment-domain';

/**
 * Get list of attachment entities
 */
const list = Endpoint.list(
  () => ({
    repository: getRepository(AttachmentEntity),
    description: 'Get list of attachment entities with domains in their url',
  }),
  async (typeQuery, params) => {
    const { list: attachments, count } = await Endpoint.defaultHandler.list(
      typeQuery.toQuery(),
      true,
    );

    return { list: await AttachmentDomain.addDomainsRelation(attachments, params?.payload), count };
  },
);

export default list;
