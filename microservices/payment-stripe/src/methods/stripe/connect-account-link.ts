import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import StripeSdk from 'stripe';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class ConnectAccountLinkInput {
  @IsString()
  userId: string;

  @IsString()
  refreshUrl: string;

  @IsString()
  returnUrl: string;
}

class ConnectAccountLinkOutput {
  @IsObject()
  accountLink: StripeSdk.AccountLink;
}

/**
 * Create new link for access to the connect account
 */
const connectAccountLink = Endpoint.custom(
  () => ({
    input: ConnectAccountLinkInput,
    output: ConnectAccountLinkOutput,
    description: 'Create new link for access to the connect account',
  }),
  async ({ userId, refreshUrl, returnUrl }) => {
    const service = (await Factory.create(getManager())) as Stripe;

    return {
      accountLink: await service.getConnectAccountLink(userId, refreshUrl, returnUrl),
    };
  },
);

export default connectAccountLink;
