import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString } from 'class-validator';
import Price from '@entities/price';
import Stripe from '@services/payment-gateway/stripe';

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
    const service = await Stripe.init();

    return {
      entity: await service.createPrice(params),
    };
  },
);

export default create;
