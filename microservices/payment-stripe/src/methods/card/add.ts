import { Endpoint } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Card from '@entities/card';
import Factory from '@services/payment-gateway/factory';

class CardAddInput {
  @IsString()
  userId: string;

  @IsString()
  expired: string;

  @IsString()
  digits: string;

  @IsString()
  cvc: string;
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
  async ({ userId, digits, cvc, expired }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addCard(userId, expired, digits, cvc),
    };
  },
);

export default add;
