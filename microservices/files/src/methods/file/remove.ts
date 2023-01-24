import { Endpoint } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { getManager } from 'typeorm';
import File from '@entities/file';
import Factory from '@services/file/factory';

class FileRemoveInput {
  @IsString()
  @IsNotEmpty()
  id: string;
}

class FileRemoveOutput {
  @IsBoolean()
  isRemoved: boolean;
}

/**
 * Remove file
 */
const remove = Endpoint.custom(
  () => ({
    input: FileRemoveInput,
    output: FileRemoveOutput,
    description: 'Remove file',
  }),
  async ({ id }) => {
    const manager = getManager();
    // find the file to pass its type to the factory
    const file = await manager.getRepository(File).findOne(id);

    if (!file) {
      throw new BaseException({
        status: 404,
        message: 'The requested file was not found.',
      });
    }

    const service = await Factory.create(file.type, manager);

    return {
      isRemoved: await service.remove(file),
    };
  },
);

export default remove;
