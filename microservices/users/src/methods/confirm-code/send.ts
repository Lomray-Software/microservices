import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { getRepository } from 'typeorm';
import ConfirmCode from '@entities/confirm-code';
import { Factory, ConfirmBy } from '@services/confirm/factory';

class ConfirmSendInput {
  @IsEnum(ConfirmBy)
  type: ConfirmBy;

  @IsString()
  login: string;
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
  async ({ type, login }) => {
    const service = Factory.create(type, getRepository(ConfirmCode));

    return {
      isSent: await service.send(login),
    };
  },
);

export default send;
