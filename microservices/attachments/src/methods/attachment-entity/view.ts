import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import AttachmentEntity from '@entities/attachment-entity';
import AttachmentDomain from '@services/attachment-domain';

/**
 * View attachment entity
 */
const view = Endpoint.view(
  () => ({
    repository: getRepository(AttachmentEntity),
    description: 'View attachment entity with domain in its url',
  }),
  async (typeQuery, params) => {
    const { entity } = await Endpoint.defaultHandler.view(typeQuery.toQuery());

    return {
      entity: entity.attachment
        ? await AttachmentDomain.addDomainRelation(entity, params?.payload)
        : entity,
    };
  },
);

export default view;
