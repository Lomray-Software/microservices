import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';
import Stripe from '@services/payment-gateway/stripe';

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
  @IsUndefinable()
  @IsNullable()
  @ValidateIf((input) => input.isEmbeddedMode)
  returnUrl: string | null;

  @Length(1, 40)
  @IsString()
  @IsUndefinable()
  customerEmail?: string;

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
  async ({
    cartId,
    successUrl,
    cancelUrl,
    userId,
    customerEmail,
    returnUrl,
    isEmbeddedMode = false,
  }) => {
    const service = await Stripe.init();

    return service.createCartCheckout(
      isEmbeddedMode
        ? {
            isEmbeddedMode,
            cartId,
            userId,
            returnUrl,
            customerEmail,
          }
        : {
            isEmbeddedMode,
            cartId,
            userId,
            successUrl,
            cancelUrl,
            customerEmail,
          },
    );
  },
);

export default createCartCheckout;
