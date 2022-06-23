import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import Attachment from '@entities/attachment';
import AttachmentDomain from '@services/attachment-domain';
/**
 * View attachment
 */
const view = Endpoint.view(
  () => ({
    repository: getRepository(Attachment),
    description: 'View attachment with domain in its url',
  }),
  async (typeQuery) => {
    const { entity } = await Endpoint.defaultHandler.view(typeQuery.toQuery());

    return { entity: await AttachmentDomain.addDomain(entity) };
  },
);

export default view;
