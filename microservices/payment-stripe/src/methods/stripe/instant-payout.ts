import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNumber, IsString, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';
import { PayoutMethodType } from '@services/payment-gateway/stripe';
import type { IInstantPayoutParams } from '@services/payment-gateway/stripe';

class CreateInstantPayoutInput implements IInstantPayoutParams {
  @Length(1, 36)
  @IsString()
  userId: string;

  @Min(1)
  @IsNumber()
  amount: number;

  @JSONSchema({
    description:
      'Microservice entity. Your internal microservice payout (withdraw) or any else entity, that implements custom functionality',
  })
  @Length(1, 36)
  @IsString()
  @IsUndefinable()
  entityId?: string;

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
  async ({ userId, amount, entityId, payoutMethodId, payoutMethodType }) => {
    const service = await Factory.create(getManager());

    return {
      isInstantiated: await service.instantPayout({
        userId,
        amount,
        entityId,
        ...(payoutMethodId && payoutMethodType
          ? { payoutMethod: { id: payoutMethodId, method: payoutMethodType } }
          : {}),
      }),
    };
  },
);

export default instantPayout;
