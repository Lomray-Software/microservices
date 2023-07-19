import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Card from '@entities/card';
import type { ICardParams } from '@services/payment-gateway/abstract';
import Factory from '@services/payment-gateway/factory';

class CardAddInput implements ICardParams {
  @IsString()
  userId: string;

  // Card token from stripe
  @IsString()
  @IsUndefinable()
  token?: string;

  // Manually collected card data
  @IsString()
  @IsUndefinable()
  expired?: string;

  @IsString()
  @IsUndefinable()
  digits?: string;

  @IsString()
  @IsUndefinable()
  cvc?: string;
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
  async ({ userId, digits, cvc, token, expired }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addCard({ userId, token, expired, digits, cvc }),
    };
  },
);

export default add;
