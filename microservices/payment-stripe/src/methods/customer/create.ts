import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Customer from '@entities/customer';
import Factory from '@services/payment-gateway/factory';

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
    const service = await Factory.create(getManager());

    return {
      entity: await service.createCustomer(userId, email, name),
    };
  },
);

export default create;
