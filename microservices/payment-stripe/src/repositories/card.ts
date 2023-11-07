import { EntityRepository, Repository } from 'typeorm';
import CardEntity from '@entities/card';

@EntityRepository(CardEntity)
class Card extends Repository<CardEntity> {
  /**
   * Returns extracted payment method from card
   * @description Support old payment method storage in params
   */
  public static extractPaymentMethodId({ paymentMethodId, params }: CardEntity): string | null {
    return paymentMethodId || params.paymentMethodId || null;
  }
}

export default Card;
