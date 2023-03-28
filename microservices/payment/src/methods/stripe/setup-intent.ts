import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class SetupIntentInput {
  @IsString()
  userId: string;
}

class SetupIntentOutput {
  @IsNullable()
  @IsString()
  clientSecretToken: string | null;
}

/**
 * Setup intent and return client token to get access to adding payment method
 */
const setupIntent = Endpoint.custom(
  () => ({
    input: SetupIntentInput,
    output: SetupIntentOutput,
    description: 'Setup intent and return client secret key',
  }),
  async ({ userId }) => {
    const { paymentProvider } = await remoteConfig();

    if (paymentProvider !== PaymentProvider.STRIPE) {
      throw new Error('Setup intent only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    return {
      clientSecretToken: await service.setupIntent(userId),
    };
  },
);

export default setupIntent;
