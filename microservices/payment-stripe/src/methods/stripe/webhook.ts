import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import Factory from '@services/payment-gateway/factory';

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
    const { webhookKey } = await remoteConfig();

    if (!webhookKey) {
      throw new Error('Webhook key is not provided');
    }

    const service = await Factory.create(getManager());

    service.handleWebhookEvent(body, headers['stripe-signature'], webhookKey);

    return { isHandled: true };
  },
);

export default webhook;
