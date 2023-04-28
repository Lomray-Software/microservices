import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString } from 'class-validator';
import StripeSdk from 'stripe';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import StripeAccountTypes from '@constants/stripe-acoount-types';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class ConnectAccountInput {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  accountType: StripeAccountTypes;

  @IsString()
  refreshUrl: string;

  @IsString()
  returnUrl: string;
}

class ConnectAccountOutput {
  @IsObject()
  accountLink: StripeSdk.AccountLink;
}

/**
 * Create new connected account
 */
const connectAccount = Endpoint.custom(
  () => ({
    input: ConnectAccountInput,
    output: ConnectAccountOutput,
    description: 'Create new connected account with link',
  }),
  async ({ userId, email, accountType, refreshUrl, returnUrl }) => {
    const { paymentOptions } = await remoteConfig();

    if (!paymentOptions) {
      throw new Error('Payment intent only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

    return {
      accountLink: await service.connectAccount(userId, email, accountType, refreshUrl, returnUrl),
    };
  },
);

export default connectAccount;
