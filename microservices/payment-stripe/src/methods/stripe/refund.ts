import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class RefundInput {
  @IsString()
  transactionId: string;
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
  async ({ transactionId }) => {
    const service = await Factory.create(getManager());

    return {
      isInstantiated: await service.refund({ transactionId }),
    };
  },
);

export default refund;
