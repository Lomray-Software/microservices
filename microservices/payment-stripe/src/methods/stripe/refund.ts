import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsString, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import RefundAmountType from '@constants/refund-amount-type';
import Refund from '@entities/refund';
import Factory from '@services/payment-gateway/factory';

class RefundInput {
  @IsString()
  transactionId: string;

  // Float value
  @Min(1)
  @IsNumber()
  @IsUndefinable()
  amount?: number;

  @IsEnum(RefundAmountType)
  @IsUndefinable()
  refundAmountType?: RefundAmountType;

  @Length(1, 36)
  @IsString()
  @IsUndefinable()
  entityId?: string;

  @JSONSchema({
    description: 'Abstract entity type',
  })
  @Length(1, 50)
  @IsString()
  @IsUndefinable()
  type?: string;

  @IsBoolean()
  @IsUndefinable()
  refundApplicationCollectedAmount?: boolean;
}

class RefundOutput {
  @IsObject()
  @Type(() => Refund)
  entity: Refund;
}

/**
 * Create transaction refund
 * @description By default will be refunded receiver revenue without fees
 */
const refund = Endpoint.custom(
  () => ({
    input: RefundInput,
    output: RefundOutput,
    description: 'Create transaction refund',
  }),
  async ({
    transactionId,
    amount,
    refundAmountType,
    entityId,
    refundApplicationCollectedAmount,
  }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.refund({
        transactionId,
        amount,
        refundAmountType,
        entityId,
        refundApplicationCollectedAmount,
      }),
    };
  },
);

export default refund;
