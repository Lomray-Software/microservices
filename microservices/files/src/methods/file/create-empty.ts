import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, Length } from 'class-validator';
import { getManager } from 'typeorm';
import FileType from '@constants/file-type';
import File from '@entities/file';
import Factory from '@services/file/factory';
import FilePostProcess from '@services/file-post-process';

class FileCreateEmptyInput {
  @IsEnum(FileType)
  type: FileType;

  @Length(3)
  fileName: string;

  @Length(1, 36)
  @IsUndefinable()
  userId: string;

  @Length(1, 150)
  @IsUndefinable()
  alt: string;
}

class FileCreateEmptyOutput {
  @IsObject()
  @Type(() => File)
  entity: File;
}

/**
 * Create empty file
 */
const createEmpty = Endpoint.custom(
  () => ({
    input: FileCreateEmptyInput,
    output: FileCreateEmptyOutput,
    description: 'Create empty file',
  }),
  async ({ type, fileName, alt, userId, payload }) => {
    const service = await Factory.create(type, getManager(), true);
    const file = await service.save(fileName, userId, alt);

    return {
      entity: await FilePostProcess.handle(file, payload),
    };
  },
);

export default createEmpty;
