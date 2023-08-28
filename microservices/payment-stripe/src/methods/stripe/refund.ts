import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import RefundAmountType from '@constants/refund-amount-type';
import Refund from '@entities/refund';
import Factory from '@services/payment-gateway/factory';

class RefundInput {
  @IsString()
  transactionId: string;

  // Float value
  @IsNumber()
  @IsUndefinable()
  amount?: number;

  @IsEnum(RefundAmountType)
  @IsUndefinable()
  refundAmountType?: RefundAmountType;

  @IsString()
  @IsUndefinable()
  entityId?: string;
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
  async ({ transactionId, amount, refundAmountType, entityId }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.refund({ transactionId, amount, refundAmountType, entityId }),
    };
  },
);

export default refund;
