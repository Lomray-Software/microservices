import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import PromoCodeEntity from '@entities/promo-code';
import Factory from '@services/payment-gateway/factory';

/**
 * Promo code subscriber
 */
@EventSubscriber()
class PromoCode implements EntitySubscriberInterface<PromoCodeEntity> {
  /**
   * This subscriber only for promo code entity
   */
  public listenTo(): typeof PromoCodeEntity {
    return PromoCodeEntity;
  }

  /**
   * Create stripe promo code and attach stripe id to entity
   */
  public async beforeInsert({ entity, manager }: InsertEvent<PromoCodeEntity>): Promise<void> {
    const service = await Factory.create(manager);

    const { id, code } = await service.createPromoCode({
      couponId: entity.couponId,
      code: entity.code,
    });

    entity.code = code;
    entity.promoCodeId = id;
  }
}

export default PromoCode;
