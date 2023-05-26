import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

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
    const service = await Factory.create(getManager());

    return {
      clientSecretToken: await service.setupIntent(userId),
    };
  },
);

export default setupIntent;
