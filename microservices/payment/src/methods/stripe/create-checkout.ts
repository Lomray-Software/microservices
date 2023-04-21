import { Endpoint, IsNullable } from '@lomray/microservice-helpers';
import { IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class CreateCheckoutInput {
  @IsString()
  priceId: string;

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
  async ({ priceId, successUrl, cancelUrl }) => {
    const { paymentProvider } = await remoteConfig();

    if (paymentProvider !== PaymentProvider.STRIPE) {
      throw new Error('Create checkout session only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    return {
      redirectUrl: await service.createCheckout({ priceId, successUrl, cancelUrl }),
    };
  },
);

export default createCheckout;
