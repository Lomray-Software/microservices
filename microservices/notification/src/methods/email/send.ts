import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { getRepository } from 'typeorm';
import Message from '@entities/message';
import Factory from '@services/email-provider/factory';

class EmailSendInput {
  @MaxLength(100)
  @IsUndefinable()
  from?: string;

  @MaxLength(100, {
    each: true,
  })
  to: string[];

  @MaxLength(100)
  @IsUndefinable()
  replyTo?: string;

  @MaxLength(255)
  subject: string;

  @IsString()
  text: string;

  @IsString()
  html: string;
}

class EmailSendOutput {
  @IsBoolean()
  isSent: boolean;
}

/**
 * Send email message
 */
const send = Endpoint.custom(
  () => ({ input: EmailSendInput, output: EmailSendOutput, description: 'Send message to email' }),
  async (params) => {
    const service = await Factory.create(getRepository(Message));

    return {
      isSent: await service.send(params),
    };
  },
);

export default send;
