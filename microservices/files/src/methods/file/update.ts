import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { Type } from 'class-transformer';
import { IsObject, Length, IsString, IsNotEmpty } from 'class-validator';
import { getManager } from 'typeorm';
import File from '@entities/file';
import FilePostProcess from '@services/file-post-process';
import Factory from '@services/file/factory';

class FileUpdateInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @Length(0, 50)
  @IsUndefinable()
  alt?: string;

  @IsString()
  @IsUndefinable()
  file?: string;
}

class FileUpdateOutput {
  @IsObject()
  @Type(() => File)
  entity: File;
}

/**
 * Update file
 */
const update = Endpoint.custom(
  () => ({
    input: FileUpdateInput,
    output: FileUpdateOutput,
    description: 'Update file',
  }),
  async ({ id, file, alt, payload }) => {
    const manager = getManager();
    // find the file to pass its type to the factory
    const fileEntity = await manager.getRepository(File).findOne(id);

    if (!fileEntity) {
      throw new BaseException({
        status: 404,
        message: 'The requested file was not found.',
      });
    }

    const service = await Factory.create(fileEntity.type, manager);

    return {
      entity: await FilePostProcess.handle(await service.update(fileEntity, file, alt), payload),
    };
  },
);

export default update;
