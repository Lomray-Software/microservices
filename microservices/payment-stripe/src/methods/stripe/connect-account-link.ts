import { Endpoint } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import Stripe from '@services/payment-gateway/stripe';

class ConnectAccountLinkInput {
  @Length(1, 36)
  @IsString()
  userId: string;

  @IsString()
  refreshUrl: string;

  @IsString()
  returnUrl: string;
}

class ConnectAccountLinkOutput {
  @IsString()
  accountLink: string;
}

/**
 * Create new link for access to connect account
 */
const connectAccountLink = Endpoint.custom(
  () => ({
    input: ConnectAccountLinkInput,
    output: ConnectAccountLinkOutput,
    description: 'Create new link for access to the connect account',
  }),
  async ({ userId, refreshUrl, returnUrl }) => {
    const service = await Stripe.init();

    return {
      accountLink: await service.getConnectAccountLink(userId, refreshUrl, returnUrl),
    };
  },
);

export default connectAccountLink;
