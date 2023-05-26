import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import CardType from '@constants/card-type';
import Card from '@entities/card';
import Factory from '@services/payment-gateway/factory';

class CardAddInput {
  @IsString()
  userId: string;

  @IsString()
  expired: string;

  @IsString()
  holderName: string;

  @IsString()
  lastDigits: string;

  @IsEnum(CardType)
  type: CardType;

  @IsString()
  cardId: string;

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
  async () => {
    const service = await Factory.create(getManager());

    return {
      entity: await service.addCard(),
    };
  },
);

export default add;
