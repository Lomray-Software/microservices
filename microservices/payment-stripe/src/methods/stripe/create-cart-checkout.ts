import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateCartCheckoutInput {
  @IsString()
  cartId: string;

  @IsString()
  userId: string;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}

class CreateCartCheckoutOutput {
  @IsNullable()
  @IsString()
  redirectUrl: string | null;
}

/**
 * Creates checkout session and return redirect url to stripe checkout
 */
const createCartCheckout = Endpoint.custom(
  () => ({
    input: CreateCartCheckoutInput,
    output: CreateCartCheckoutOutput,
    description: 'Setup intent and return client secret key',
  }),
  async ({ cartId, successUrl, cancelUrl, userId }) => {
    const service = await Factory.create(getManager());

    return {
      redirectUrl: await service.createCartCheckout({
        cartId,
        successUrl,
        cancelUrl,
        userId,
      }),
    };
  },
);

export default createCartCheckout;
