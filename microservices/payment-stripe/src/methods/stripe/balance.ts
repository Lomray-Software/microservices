import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import type StripeSdk from 'stripe';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class BalanceInput {
  @IsString()
  userId: string;
}

class BalanceOutput {
  @IsObject()
  balance: StripeSdk.Balance;
}

/**
 * Returns balance
 */
const balance = Endpoint.custom(
  () => ({
    input: BalanceInput,
    output: BalanceOutput,
    description: 'Returns balance',
  }),
  async ({ userId }) => {
    const service = await Factory.create(getManager());

    return {
      balance: await service.getBalance(userId),
    };
  },
);

export default balance;
