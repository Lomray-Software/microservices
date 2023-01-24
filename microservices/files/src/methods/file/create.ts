import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsEnum, Length, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import FileType from '@constants/file-type';
import File from '@entities/file';
import FilePostProcess from '@services/file-post-process';
import Factory from '@services/file/factory';

class FileCreateInput {
  @IsEnum(FileType)
  type: FileType;

  @Length(1, 36)
  @IsUndefinable()
  userId: string;

  @Length(0, 150)
  @IsUndefinable()
  alt: string;

  @IsString()
  file: string; // base64 string
}

class FileCreateOutput {
  @IsObject()
  @Type(() => File)
  entity: File;
}

/**
 * Create file
 */
const create = Endpoint.custom(
  () => ({
    input: FileCreateInput,
    output: FileCreateOutput,
    description: 'Create file',
  }),
  async ({ type, file, userId, alt, payload }) => {
    const service = await Factory.create(type, getManager());

    return {
      entity: await FilePostProcess.handle(await service.save(file, userId, alt), payload),
    };
  },
);

export default create;
