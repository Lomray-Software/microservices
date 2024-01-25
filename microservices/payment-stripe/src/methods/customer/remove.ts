import { Endpoint } from '@lomray/microservice-helpers';
import { IsBoolean, IsString } from 'class-validator';
import Stripe from '@services/payment-gateway/stripe';

class CustomerRemoveInput {
  @IsString()
  userId: string;
}

class CustomerRemoveOutput {
  @IsBoolean()
  isRemoved: boolean;
}

/**
 * Remove customer
 */
const remove = Endpoint.custom(
  () => ({
    input: CustomerRemoveInput,
    output: CustomerRemoveOutput,
    description: 'Remove customer',
  }),
  async ({ userId }) => {
    const service = await Stripe.init();

    return {
      isRemoved: await service.removeCustomer(userId),
    };
  },
);

export default remove;
