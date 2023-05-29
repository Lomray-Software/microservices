import { Endpoint } from '@lomray/microservice-helpers';
import { IsNumber, IsObject, IsString } from 'class-validator';
import type StripeSdk from 'stripe';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateInstantPayoutInput {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;
}

class CreateInstantPayoutOutput {
  @IsObject()
  payout: StripeSdk.Payout;
}

/**
 * Create instant payout
 */
const instantPayout = Endpoint.custom(
  () => ({
    input: CreateInstantPayoutInput,
    output: CreateInstantPayoutOutput,
    description: 'Create instant payout',
  }),
  async ({ userId, amount }) => {
    const service = await Factory.create(getManager());

    return {
      payout: await service.instantPayout({ userId, amount }),
    };
  },
);

export default instantPayout;
