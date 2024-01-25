import { Endpoint } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import Stripe from '@services/payment-gateway/stripe';

class DashboardLoginLinkInput {
  @Length(1, 36)
  @IsString()
  userId: string;
}

class DashboardLoginLinkOutput {
  @IsString()
  url: string;
}

/**
 * Create new link for access to the express account dashboard
 * @description Eligible only for the express accounts
 */
const dashboardLoginLink = Endpoint.custom(
  () => ({
    input: DashboardLoginLinkInput,
    output: DashboardLoginLinkOutput,
    description: 'Create new link for access to the express account dashboard',
  }),
  async ({ userId }) => {
    const service = await Stripe.init(getManager());

    return {
      url: await service.getDashboardLoginLink(userId),
    };
  },
);

export default dashboardLoginLink;
