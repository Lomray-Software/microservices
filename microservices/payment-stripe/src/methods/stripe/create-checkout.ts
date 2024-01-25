import { Endpoint, IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import Stripe from '@services/payment-gateway/stripe';

class CreateCheckoutInput {
  @Length(1, 36)
  @IsString()
  userId: string;

  @IsString()
  priceId: string;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;

  @IsBoolean()
  @IsUndefinable()
  isAllowPromoCode?: boolean;
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
  async ({ priceId, successUrl, cancelUrl, userId, isAllowPromoCode }) => {
    const service = await Stripe.init(getManager());

    return {
      redirectUrl: await service.createCheckout({
        priceId,
        userId,
        successUrl,
        cancelUrl,
        isAllowPromoCode,
      }),
    };
  },
);

export default createCheckout;
