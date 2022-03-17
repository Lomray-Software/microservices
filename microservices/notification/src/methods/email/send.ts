import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { getRepository } from 'typeorm';
import { EMAIL_PROVIDER } from '@constants/index';
import Message from '@entities/message';
import Factory from '@services/email-provider/factory';

class EmailSendInput {
  @MaxLength(100)
  @IsUndefinable()
  from?: string;

  @MaxLength(20, {
    each: true,
  })
  to: string[];

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
    const service = await Factory.create(EMAIL_PROVIDER, getRepository(Message));

    return {
      isSent: await service.send(params),
    };
  },
);

export default send;
