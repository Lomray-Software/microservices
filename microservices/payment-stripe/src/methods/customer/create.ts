import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { getManager } from 'typeorm';
import Customer from '@entities/customer';
import type IAddress from '@interfaces/address';
import Factory from '@services/payment-gateway/factory';

class Address implements IAddress {
  @IsString()
  @IsUndefinable()
  city?: string;

  @IsString()
  @IsUndefinable()
  country?: string;

  @IsString()
  @IsUndefinable()
  line1?: string;

  @IsString()
  @IsUndefinable()
  line2?: string;

  @JSONSchema({
    description: 'Required for tax compute',
  })
  @IsString()
  @IsUndefinable()
  postalCode?: string;

  @IsString()
  @IsUndefinable()
  state?: string;
}

class CustomerCreateInput {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsObject()
  @IsUndefinable()
  @Type(() => Address)
  address?: Address;
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
  async ({ userId, email, name, address }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.createCustomer(userId, email, name, address),
    };
  },
);

export default create;
