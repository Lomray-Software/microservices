import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Customer from '@entities/customer';
import Factory from '@services/payment-gateway/factory';

class CustomerCreateInput {
  @IsString()
  userId: string;
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
  async ({ userId }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.createCustomer(userId),
    };
  },
);

export default create;
