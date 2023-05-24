import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

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
    const { paymentProvider } = await remoteConfig();

    if (paymentProvider !== PaymentProvider.STRIPE) {
      throw new Error('Refund only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    return {
      isInstantiated: await service.refund({ transactionId }),
    };
  },
);

export default refund;
