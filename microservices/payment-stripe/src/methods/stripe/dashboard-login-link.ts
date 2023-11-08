import { Endpoint } from '@lomray/microservice-helpers';
import { IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import Factory from '@services/payment-gateway/factory';

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
    const service = await Factory.create(getManager());

    return {
      url: await service.getDashboardLoginLink(userId),
    };
  },
);

export default dashboardLoginLink;
