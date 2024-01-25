import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Product from '@entities/product';
import Stripe from '@services/payment-gateway/stripe';

class ProductCreateInput {
  @IsString()
  entityId: string;

  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsString()
  @IsUndefinable()
  description?: string;

  @IsArray()
  @IsUndefinable()
  images?: string[];
}

class ProductCreateOutput {
  @IsObject()
  @Type(() => Product)
  entity: Product;
}

/**
 * Create new product
 */
const create = Endpoint.custom(
  () => ({
    input: ProductCreateInput,
    output: ProductCreateOutput,
    description: 'Create new product',
  }),
  async (params) => {
    const service = await Stripe.init(getManager());

    return {
      entity: await service.createProduct(params),
    };
  },
);

export default create;
