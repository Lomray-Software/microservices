import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Price from '@entities/price';
import Factory from '@services/payment-gateway/factory';

class PriceCreateInput {
  @IsString()
  productId: string;

  @IsString()
  currency: string;

  @IsString()
  userId: string;

  @IsNumber()
  unitAmount: number;
}

class PriceCreateOutput {
  @IsObject()
  @Type(() => Price)
  entity: Price;
}

/**
 * Create new price
 */
const create = Endpoint.custom(
  () => ({
    input: PriceCreateInput,
    output: PriceCreateOutput,
    description: 'Create new price',
  }),
  async (params) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.createPrice(params),
    };
  },
);

export default create;
