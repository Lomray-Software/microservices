import { Endpoint } from '@lomray/microservice-helpers';
import { IsArray, IsBoolean } from 'class-validator';
import Stripe from '@services/payment-gateway/stripe';

class PayoutInput {
  @IsArray()
  entities: { id: string; userId: string }[];
}

class PayoutOutput {
  @IsBoolean()
  isComplete: boolean;
}

/**
 * Create payout for product owners
 */
const payout = Endpoint.custom(
  () => ({
    input: PayoutInput,
    output: PayoutOutput,
    description: 'Create payout for product owners',
  }),
  async ({ entities }) => {
    const service = await Stripe.init();

    return {
      isComplete: await service.payout(entities),
    };
  },
);

export default payout;
