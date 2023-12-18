import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import RefundEntity from '@entities/refund';
import RefundService from '@services/refund';

/**
 * Refund subscriber
 */
@EventSubscriber()
class Refund implements EntitySubscriberInterface<RefundEntity> {
  /**
   * This subscriber only for Refund entity
   */
  public listenTo(): typeof RefundEntity {
    return RefundEntity;
  }

  /**
   * Handle Refund event: after insert
   */
  public async afterInsert({ entity, manager }: InsertEvent<RefundEntity>): Promise<void> {
    await RefundService.handleAfterCreate(entity, manager);
  }

  /**
   * Handle Refund event: after update
   */
  public async afterUpdate({ entity, manager }: UpdateEvent<RefundEntity>): Promise<void> {
    if (!entity) {
      return;
    }

    await RefundService.handleAfterUpdate(entity as RefundEntity, manager);
  }
}

export default Refund;
