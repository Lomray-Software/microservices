import { Endpoint } from '@lomray/microservice-helpers';
import { IsArray, IsBoolean } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class PayoutInput {
  @IsArray()
  entities: { id: string; userId: string }[];
}

class PayoutOutput {
  @IsBoolean()
  isHandled: boolean;
}

/**
 * Create payout for product owners
 */
const payout = Endpoint.custom(
  () => ({
    input: PayoutInput,
    output: PayoutOutput,
    description: 'Create payout for product owners',
  }),
  async ({ entities }) => {
    const { paymentProvider } = await remoteConfig();

    if (paymentProvider !== PaymentProvider.STRIPE) {
      throw new Error('Payout only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    return {
      isHandled: service.payout(entities),
    };
  },
);

export default payout;
