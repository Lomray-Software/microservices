import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import FileEntity from '@entities/file-entity';
import FilePostProcess from '@services/file-post-process';

/**
 * View file entity
 */
const view = Endpoint.view(
  () => ({
    repository: getRepository(FileEntity),
    description: 'View file entity with domain in its url',
  }),
  async (typeQuery, params) => {
    const { entity } = await Endpoint.defaultHandler.view(typeQuery.toQuery());

    return {
      entity: entity.file ? await FilePostProcess.handleRelation(entity, params?.payload) : entity,
    };
  },
);

export default view;
