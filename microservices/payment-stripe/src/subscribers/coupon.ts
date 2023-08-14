import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';
import CouponEntity from '@entities/coupon';
import Factory from '@services/payment-gateway/factory';

/**
 * Coupon subscriber
 */
@EventSubscriber()
class Coupon implements EntitySubscriberInterface<CouponEntity> {
  /**
   * This subscriber only for coupon entity
   */
  public listenTo(): typeof CouponEntity {
    return CouponEntity;
  }

  /**
   * Handle coupon remove
   */
  public async beforeRemove({ entity, manager }: RemoveEvent<CouponEntity>): Promise<void> {
    if (!entity?.couponId) {
      return;
    }

    const service = await Factory.create(manager);

    const isDeleted = await service.removeCoupon(entity.couponId);

    if (!isDeleted) {
      throw new BaseException({
        status: 500,
        message: "Can't remove coupon. Please try latter.",
      });
    }
  }
}

export default Coupon;
