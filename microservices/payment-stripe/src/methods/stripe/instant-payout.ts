import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNumber, IsString, Length, Min } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';
import { PayoutMethodType } from '@services/payment-gateway/stripe';

class CreateInstantPayoutInput {
  @Length(1, 36)
  @IsString()
  userId: string;

  @Min(1)
  @IsNumber()
  amount: number;

  @Length(1, 36)
  @IsString()
  @IsUndefinable()
  payoutMethodId?: string;

  @IsEnum(PayoutMethodType)
  @IsUndefinable()
  payoutMethodType?: PayoutMethodType;
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
  async ({ userId, amount, payoutMethodId, payoutMethodType }) => {
    const service = await Factory.create(getManager());

    return {
      isInstantiated: await service.instantPayout({
        userId,
        amount,
        ...(payoutMethodId && payoutMethodType
          ? { payoutMethod: { id: payoutMethodId, method: payoutMethodType } }
          : {}),
      }),
    };
  },
);

export default instantPayout;
