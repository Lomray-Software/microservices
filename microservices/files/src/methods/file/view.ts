import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import File from '@entities/file';
import FilePostProcess from '@services/file-post-process';
/**
 * View file
 */
const view = Endpoint.view(
  () => ({
    repository: getRepository(File),
    description: 'View file with domain in its url',
  }),
  async (typeQuery, params) => {
    const { entity } = await Endpoint.defaultHandler.view(typeQuery.toQuery());

    return { entity: await FilePostProcess.handle(entity, params?.payload) };
  },
);

export default view;
