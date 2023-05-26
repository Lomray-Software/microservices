import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import Stripe from 'stripe';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import Factory from '@services/payment-gateway/factory';

class WebhookInput {
  @IsObject()
  body: Stripe.Event;

  @IsString()
  rawBody: string;
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
  async ({ rawBody, payload }) => {
    const { webhookKey } = await remoteConfig();

    if (!webhookKey) {
      throw new Error('Webhook key is not provided');
    }

    if (!payload?.headers?.['stripe-signature']) {
      throw new Error('Stripe signature is mot provided');
    }

    const service = await Factory.create(getManager());

    service.handleWebhookEvent(rawBody, payload.headers['stripe-signature'] as string, webhookKey);

    return { isHandled: true };
  },
);

export default webhook;
