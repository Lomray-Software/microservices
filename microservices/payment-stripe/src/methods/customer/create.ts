import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import Customer from '@entities/customer';
import Stripe from '@services/payment-gateway/stripe';

class CustomerCreateInput {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  name: string;
}

class CustomerCreateOutput {
  @IsObject()
  @Type(() => Customer)
  entity: Customer;
}

/**
 * Create new customer
 */
const create = Endpoint.custom(
  () => ({
    input: CustomerCreateInput,
    output: CustomerCreateOutput,
    description: 'Create new customer',
  }),
  async ({ userId, email, name }) => {
    const service = await Stripe.init();

    return {
      entity: await service.createCustomer(userId, email, name),
    };
  },
);

export default create;
