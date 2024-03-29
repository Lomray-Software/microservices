import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import type StripeSDK from 'stripe';
import remoteConfig from '@config/remote';
import Stripe from '@services/payment-gateway/stripe';

class WebhookInput {
  @IsObject()
  body: StripeSDK.Event;

  @IsString()
  rawBody: string;

  @IsObject()
  query: {
    id: string; // webhook id
  };
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
    description: 'Handling and processing stripe webhooks.',
  }),
  async ({ rawBody, query, payload }) => {
    const { webhookKeys } = await remoteConfig();
    const webhookKey = webhookKeys?.[query?.id];

    if (!webhookKey) {
      throw new Error(`Webhook key is not provided for id: ${query.id}`);
    }

    if (!payload?.headers?.['stripe-signature']) {
      throw new Error('Stripe signature is mot provided.');
    }

    const service = await Stripe.init();

    // Should throw an error if webhook handle was failed
    await service.handleWebhookEvent(
      rawBody,
      payload.headers['stripe-signature'] as string,
      webhookKey,
      query.id,
    );

    return {
      isHandled: true,
    };
  },
);

export default webhook;
