import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateInstantPayoutInput {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;
}

class CreateInstantPayoutOutput {
  @IsBoolean()
  isInstantiated: boolean;
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
      isInstantiated: await service.instantPayout({ userId, amount }),
    };
  },
);

export default instantPayout;
