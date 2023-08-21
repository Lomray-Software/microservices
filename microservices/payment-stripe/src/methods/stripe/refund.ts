import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import RefundAmountType from '@constants/refund-amount-type';
import Factory from '@services/payment-gateway/factory';

class RefundInput {
  @IsString()
  transactionId: string;

  @IsEnum(RefundAmountType)
  @IsUndefinable()
  refundAmountType?: RefundAmountType;
}

class RefundOutput {
  @IsBoolean()
  isInstantiated: boolean;
}

/**
 * Create transaction refund
 */
const refund = Endpoint.custom(
  () => ({
    input: RefundInput,
    output: RefundOutput,
    description: 'Create transaction refund',
  }),
  async ({ transactionId, refundAmountType }) => {
    const service = await Factory.create(getManager());

    return {
      isInstantiated: await service.refund({ transactionId, refundAmountType }),
    };
  },
);

export default refund;
