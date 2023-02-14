import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import FileEntity from '@entities/file-entity';
import FilePostProcess from '@services/file-post-process';

/**
 * Get list of files entities
 */
const list = Endpoint.list(
  () => ({
    repository: getRepository(FileEntity),
    description: 'Get list of files entities with domains in their url',
  }),
  async (typeQuery, params) => {
    const { list: files, count } = await Endpoint.defaultHandler.list(typeQuery.toQuery());

    return { list: await FilePostProcess.handleMultipleRelations(files, params?.payload), count };
  },
);

export default list;
