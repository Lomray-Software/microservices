import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsObject, IsString } from 'class-validator';
import { getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import { Factory, ConfirmBy } from '@services/confirm/factory';

class ConfirmSendInput {
  @IsEnum(ConfirmBy)
  type: ConfirmBy;

  @IsString()
  login: string;

  @IsObject()
  @IsUndefinable()
  context?: Record<string, any>;
}

class ConfirmSendOutput {
  @IsBoolean()
  isSent: boolean;
}

/**
 * Send confirm code
 */
const send = Endpoint.custom(
  () => ({ input: ConfirmSendInput, output: ConfirmSendOutput, description: 'Send confirm code' }),
  async ({ type, login, context }) => {
    const service = Factory.create(type, getRepository(ConfirmCode), context);

    return {
      isSent: await service.send(login),
    };
  },
);

export { ConfirmSendInput, ConfirmSendOutput, send };
