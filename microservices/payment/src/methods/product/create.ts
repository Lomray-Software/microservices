import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Product from '@entities/product';
import Factory from '@services/payment-gateway/factory';

class ProductCreateInput {
  @IsString()
  entityId: string;

  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsString()
  description?: string;

  @IsArray()
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
    const service = await Factory.create(getManager());

    return {
      entity: await service.createProductEntity(params),
    };
  },
);

export default create;
