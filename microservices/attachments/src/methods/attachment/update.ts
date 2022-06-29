import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { Type } from 'class-transformer';
import { IsObject, Length, IsString, IsNotEmpty } from 'class-validator';
import { getManager } from 'typeorm';
import Attachment from '@entities/attachment';
import AttachmentDomain from '@services/attachment-domain';
import Factory from '@services/attachment/factory';

class AttachmentUpdateInput {
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

class AttachmentUpdateOutput {
  @IsObject()
  @Type(() => Attachment)
  entity: Attachment;
}

/**
 * Update attachment
 */
const update = Endpoint.custom(
  () => ({
    input: AttachmentUpdateInput,
    output: AttachmentUpdateOutput,
    description: 'Update attachment',
  }),
  async ({ id, file, alt }) => {
    const manager = getManager();
    // find the attachment to pass its type to the factory
    const attachment = await manager.getRepository(Attachment).findOne(id);

    if (!attachment) {
      throw new BaseException({
        status: 404,
        message: 'The requested resource was not found.',
      });
    }

    const service = await Factory.create(attachment.type, manager);

    return {
      entity: await AttachmentDomain.addDomain(await service.update(attachment, file, alt)),
    };
  },
);

export default update;
