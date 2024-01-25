import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, IsString, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import RefundAmountType from '@constants/refund-amount-type';
import Stripe from '@services/payment-gateway/stripe';

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
}

class RefundOutput {
  isRecognized: boolean;
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
    const service = await Stripe.init(getManager());

    return {
      isRecognized: await service.refund({
        transactionId,
        amount,
        refundAmountType,
        entityId,
      }),
    };
  },
);

export default refund;
