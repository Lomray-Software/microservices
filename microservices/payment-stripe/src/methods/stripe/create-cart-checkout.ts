import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateCartCheckoutInput {
  @IsString()
  cartId: string;

  @Length(1, 36)
  @IsString()
  userId: string;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;

  @IsBoolean()
  @IsUndefinable()
  isEmbeddedMode?: boolean;
}

class CreateCartCheckoutOutput {
  @IsNullable()
  @IsString()
  redirectUrl: string | null;

  @IsNullable()
  @IsString()
  clientSecret: string | null;
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
  async ({ cartId, successUrl, cancelUrl, userId, isEmbeddedMode = false }) => {
    const service = await Factory.create(getManager());

    return service.createCartCheckout({
      cartId,
      successUrl,
      cancelUrl,
      userId,
      isEmbeddedMode,
    });
  },
);

export default createCartCheckout;
