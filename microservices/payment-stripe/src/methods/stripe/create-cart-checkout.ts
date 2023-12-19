import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

class CreateCartCheckoutInput {
  @IsString()
  cartId: string;

  @Length(1, 36)
  @IsString()
  userId: string;

  @IsString()
  @ValidateIf((input) => !input.isEmbeddedMode)
  successUrl: string;

  @IsString()
  @ValidateIf((input) => !input.isEmbeddedMode)
  cancelUrl: string;

  @IsString()
  @ValidateIf((input) => input.isEmbeddedMode)
  returnUrl: string;

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
  async ({ cartId, successUrl, cancelUrl, userId, returnUrl, isEmbeddedMode = false }) => {
    const service = await Factory.create(getManager());

    return service.createCartCheckout(
      isEmbeddedMode
        ? {
            isEmbeddedMode,
            cartId,
            userId,
            returnUrl,
          }
        : {
            isEmbeddedMode,
            cartId,
            userId,
            successUrl,
            cancelUrl,
          },
    );
  },
);

export default createCartCheckout;
