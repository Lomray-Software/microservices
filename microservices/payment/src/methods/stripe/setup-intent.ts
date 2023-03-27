import { Endpoint } from '@lomray/microservice-helpers';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class SetupIntentInput {
  userId: string;
}

class SetupIntentOutput {
  clientSecretToken: string | null;
}

/**
 * Create setupIntent and return client token to get access to adding payment method
 */
const setupIntent = Endpoint.custom(
  () => ({
    input: SetupIntentInput,
    output: SetupIntentOutput,
    description: 'Creates setup intent and return client secret key',
  }),
  async ({ userId }) => {
    const service = (await Factory.create(getManager())) as Stripe;

    return {
      clientSecretToken: await service.setupIntent(userId),
    };
  },
);

export default setupIntent;
