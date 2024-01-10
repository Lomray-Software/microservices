import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsString, Length, Min } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';
import { PayoutMethodType } from '@services/payment-gateway/stripe';

class CreateInstantPayoutMethod {
  @Length(1, 36)
  @IsString()
  id: string;

  @IsEnum(PayoutMethodType)
  method: PayoutMethodType;
}

class CreateInstantPayoutInput {
  @Length(1, 36)
  @IsString()
  userId: string;

  @Min(1)
  @IsNumber()
  amount: number;

  @IsObject()
  @Type(() => CreateInstantPayoutMethod)
  payoutMethod: CreateInstantPayoutMethod;
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
  async ({ userId, amount, payoutMethod }) => {
    const service = await Factory.create(getManager());

    return {
      isInstantiated: await service.instantPayout({ userId, amount, payoutMethod }),
    };
  },
);

export default instantPayout;
