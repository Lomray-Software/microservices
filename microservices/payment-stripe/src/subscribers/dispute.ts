import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import DisputeEntity from '@entities/dispute';
import DisputeService from '@services/dispute';

/**
 * Dispute subscriber
 */
@EventSubscriber()
class Dispute implements EntitySubscriberInterface<DisputeEntity> {
  /**
   * This subscriber only for Dispute entity
   */
  public listenTo(): typeof DisputeEntity {
    return DisputeEntity;
  }

  /**
   * Handle Refund event: after insert
   */
  public async afterInsert({ entity }: InsertEvent<DisputeEntity>): Promise<void> {
    await DisputeService.handleAfterCreate(entity);
  }

  /**
   * Handle Refund event: after update
   */
  public async afterUpdate({ entity }: UpdateEvent<DisputeEntity>): Promise<void> {
    if (!entity) {
      return;
    }

    await DisputeService.handleAfterUpdate(entity as DisputeEntity);
  }
}

export default Dispute;
