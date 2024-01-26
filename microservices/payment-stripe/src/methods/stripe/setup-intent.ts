import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import Stripe from '@services/payment-gateway/stripe';

class SetupIntentInput {
  @Length(1, 36)
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
    const service = await Stripe.init();

    return {
      clientSecretToken: await service.setupIntent(userId),
    };
  },
);

export default setupIntent;
