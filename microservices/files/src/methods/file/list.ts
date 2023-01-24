import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import File from '@entities/file';
import FilePostProcess from '@services/file-post-process';

/**
 * Get list of files
 */
const list = Endpoint.list(
  () => ({
    repository: getRepository(File),
    description: 'Get list of files with domains in their url',
  }),
  async (typeQuery, params) => {
    const { list: files, count } = await Endpoint.defaultHandler.list(typeQuery.toQuery(), true);

    return { list: await FilePostProcess.handleMultiple(files, params?.payload), count };
  },
);

export default list;
