import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import ConnectAccount from '@entities/connect-account';
import Factory from '@services/payment-gateway/factory';

class ConnectAccountCreateInput {
  @IsString()
  userId: string;
}

class ConnectAccountCreateOutput {
  @IsObject()
  @Type(() => ConnectAccount)
  entity: ConnectAccount;
}

/**
 * Create new connected account
 */
const create = Endpoint.custom(
  () => ({
    input: ConnectAccountCreateInput,
    output: ConnectAccountCreateOutput,
    description: 'Create new connected account',
  }),
  async ({ userId }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.createConnectAccount(userId),
    };
  },
);

export default create;
