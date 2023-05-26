import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateCheckoutInput {
  @IsString()
  priceId: string;

  @IsString()
  userId: string;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}

class CreateCheckoutOutput {
  @IsNullable()
  @IsString()
  redirectUrl: string | null;
}

/**
 * Creates checkout session and return redirect url to stripe checkout
 */
const createCheckout = Endpoint.custom(
  () => ({
    input: CreateCheckoutInput,
    output: CreateCheckoutOutput,
    description: 'Setup intent and return client secret key',
  }),
  async ({ priceId, successUrl, cancelUrl, userId }) => {
    const service = await Factory.create(getManager());

    return {
      redirectUrl: await service.createCheckout({ priceId, userId, successUrl, cancelUrl }),
    };
  },
);

export default createCheckout;
