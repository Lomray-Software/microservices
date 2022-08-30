import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsEnum, Length, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import AttachmentType from '@constants/attachment-type';
import Attachment from '@entities/attachment';
import AttachmentDomain from '@services/attachment-domain';
import Factory from '@services/attachment/factory';

class AttachmentCreateInput {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @Length(1, 36)
  @IsUndefinable()
  userId: string;

  @Length(0, 150)
  @IsUndefinable()
  alt: string;

  @IsString()
  file: string; // base64 string
}

class AttachmentCreateOutput {
  @IsObject()
  @Type(() => Attachment)
  entity: Attachment;
}

/**
 * Create attachment
 */
const create = Endpoint.custom(
  () => ({
    input: AttachmentCreateInput,
    output: AttachmentCreateOutput,
    description: 'Create attachment',
  }),
  async ({ type, file, userId, alt }) => {
    const service = await Factory.create(type, getManager());

    return {
      entity: await AttachmentDomain.addDomain(await service.save(file, userId, alt)),
    };
  },
);

export default create;
