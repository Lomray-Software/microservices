import { Endpoint } from '@lomray/microservice-helpers';
import { getManager } from 'typeorm';
import { ISetupIntentParams } from '@services/payment-gateway/abstract';
import Factory from '@services/payment-gateway/factory';

class CreateSetupIntentInput implements ISetupIntentParams {
  userId: string;
}

class CreateSetupIntentOutput {
  clientSecretToken: string | null;
}

/**
 * Create setupIntent and return client token to get access to adding payment method
 */
const createSetupIntent = Endpoint.custom(
  () => ({
    input: CreateSetupIntentInput,
    output: CreateSetupIntentOutput,
    description: 'Creates setup intent and return client secret key',
  }),
  async ({ userId }) => {
    const service = await Factory.create(getManager());

    return {
      clientSecretToken: await service.createSetupIntent(userId),
    };
  },
);

export default createSetupIntent;
