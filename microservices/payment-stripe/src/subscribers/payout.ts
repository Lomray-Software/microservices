import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import PayoutEntity from '@entities/payout';
import PayoutRepository from '@repositories/payout';
import PayoutService from '@services/payout';

/**
 * Payout subscriber
 */
@EventSubscriber()
class Payout implements EntitySubscriberInterface<PayoutEntity> {
  /**
   * This subscriber only for Payout entity
   */
  public listenTo(): typeof PayoutEntity {
    return PayoutEntity;
  }

  /**
   * Handle event: after insert
   */
  public async afterInsert({ entity }: InsertEvent<PayoutEntity>): Promise<void> {
    await PayoutService.handleAfterInsert(entity);
  }

  /**
   * Handle event: after update
   */
  public async afterUpdate({ entity }: UpdateEvent<PayoutEntity>): Promise<void> {
    if (!PayoutRepository.getIsEntityPayout(entity)) {
      return;
    }

    await PayoutService.handleAfterUpdate(entity);
  }
}

export default Payout;
