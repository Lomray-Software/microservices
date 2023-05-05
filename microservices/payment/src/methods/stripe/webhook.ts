import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class WebhookInput {
  @IsString()
  body: string;

  @IsObject()
  headers: Record<string, string>;
}

class WebhookOutput {
  isHandled: boolean;
}

/**
 * Endpoint for handling and processing stripe webhooks
 */
const webhook = Endpoint.custom(
  () => ({
    input: WebhookInput,
    output: WebhookOutput,
    description: 'Get stripe webhooks handler',
  }),
  async ({ body, headers }) => {
    const { paymentProvider, paymentWebhookKey } = await remoteConfig();

    if (paymentProvider !== PaymentProvider.STRIPE) {
      throw new Error('Webhooks only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    service.handleWebhookEvent(body, headers['stripe-signature'], paymentWebhookKey);

    return { isHandled: true };
  },
);

export default webhook;