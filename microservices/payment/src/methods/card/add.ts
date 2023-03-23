import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import Card from '@entities/card';
import type { ICardParams } from '@services/payment-gateway/abstract';
import Factory from '@services/payment-gateway/factory';

class CardAddInput implements ICardParams {
  test: boolean;
}

class CardAddOutput {
  @IsObject()
  @Type(() => Card)
  entity: Card;
}

/**
 * Add new card
 */
const add = Endpoint.custom(
  () => ({ input: CardAddInput, output: CardAddOutput, description: 'Add new card' }),
  async (params) => {
    const service = await Factory.create();

    return {
      entity: await service.addCard(params),
    };
  },
);

export default add;
