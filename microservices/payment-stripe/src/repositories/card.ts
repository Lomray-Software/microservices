import { EntityManager, EntityRepository, getManager, Repository } from 'typeorm';
import CardEntity from '@entities/card';

export interface ICardDataByFingerprintParams {
  userId: string;
  fingerprint?: string | null;
  manager?: EntityManager;
  shouldExpandCard?: boolean;
}

export interface ICardDataByFingerprintResult {
  isExist: boolean;
  type?: 'paymentMethod' | 'externalAccount';
  entity?: CardEntity;
}

@EntityRepository(CardEntity)
class Card extends Repository<CardEntity> {
  /**
   * Returns card by card id
   * @description Uses to search related connect account (external account) data
   */
  public static getCardById(
    cardId: string,
    manager: EntityManager,
  ): Promise<CardEntity | undefined> {
    return manager
      .getRepository(CardEntity)
      .createQueryBuilder('card')
      .where("card.params ->> 'cardId' = :cardId", { cardId })
      .getOne();
  }

  /**
   * Returns extracted payment method from card
   * @description Support old payment method storage in params
   */
  public static extractPaymentMethodId({ paymentMethodId, params }: CardEntity): string | null {
    return paymentMethodId || params.paymentMethodId || null;
  }

  /**
   * Returns card presentation by fingerprint
   */
  public static async getCardDataByFingerprint({
    userId,
    fingerprint,
    shouldExpandCard = false,
    manager = getManager(),
  }: ICardDataByFingerprintParams): Promise<ICardDataByFingerprintResult> {
    const notExistResult = { isExist: false };

    if (!fingerprint) {
      return notExistResult;
    }

    const repository = manager.getRepository(CardEntity);

    const card = await repository.findOne({
      ...(shouldExpandCard ? {} : { select: ['id', 'userId', 'paymentMethodId', 'params'] }),
      where: {
        fingerprint,
        userId,
      },
    });

    if (card) {
      return {
        isExist: true,
        type: Card.extractPaymentMethodId(card) ? 'paymentMethod' : 'externalAccount',
        ...(shouldExpandCard ? { entity: card } : {}),
      };
    }

    return notExistResult;
  }
}

export default Card;
