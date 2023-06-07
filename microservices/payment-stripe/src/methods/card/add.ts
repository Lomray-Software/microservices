import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import Card from '@entities/card';
import { ICardParams } from '@services/payment-gateway/abstract';
import Factory from '@services/payment-gateway/factory';

class CardAddInput implements ICardParams {
  @IsString()
  userId: string;

  @IsString()
  expired: string;

  @IsString()
  lastDigits: string;

  @IsString()
  funding: string;

  @IsString()
  brand: string;

  @IsUndefinable()
  @IsString()
  holderName?: string;

  @IsUndefinable()
  @IsString()
  cardId?: string;

  @IsUndefinable()
  @IsString()
  paymentMethodId?: string;

  @IsBoolean()
  @IsUndefinable()
  isDefault?: boolean;
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
  async ({
    userId,
    lastDigits,
    funding,
    brand,
    cardId,
    isDefault,
    expired,
    paymentMethodId,
    holderName,
  }) => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addCard({
        userId,
        lastDigits,
        funding,
        brand,
        cardId,
        isDefault,
        expired,
        paymentMethodId,
        holderName,
      }),
    };
  },
);

export default add;
