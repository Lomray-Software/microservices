import { Endpoint } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { getManager } from 'typeorm';
import Attachment from '@entities/attachment';
import Factory from '@services/attachment/factory';

class AttachmentRemoveInput {
  @IsString()
  @IsNotEmpty()
  id: string;
}

class AttachmentRemoveOutput {
  @IsBoolean()
  isRemoved: boolean;
}

/**
 * Remove attachment
 */
const remove = Endpoint.custom(
  () => ({
    input: AttachmentRemoveInput,
    output: AttachmentRemoveOutput,
    description: 'Remove attachment',
  }),
  async ({ id }) => {
    const manager = getManager();
    const attachment = await manager.getRepository(Attachment).findOne(id, { select: ['type'] });

    if (!attachment) {
      throw new BaseException({
        status: 404,
        message: 'The requested resource was not found.',
      });
    }

    const service = await Factory.create(attachment.type, manager);

    return {
      isRemoved: await service.remove(id),
    };
  },
);

export default remove;
