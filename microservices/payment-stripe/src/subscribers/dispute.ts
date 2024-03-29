import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import DisputeEntity from '@entities/dispute';
import DisputeRepository from '@repositories/dispute';
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
  public async afterInsert({ entity, manager }: InsertEvent<DisputeEntity>): Promise<void> {
    await DisputeService.handleAfterCreate(entity, manager);
  }

  /**
   * Handle Refund event: after update
   */
  public async afterUpdate({ entity }: UpdateEvent<DisputeEntity>): Promise<void> {
    if (!DisputeRepository.getIsEntityDispute(entity)) {
      return;
    }

    await DisputeService.handleAfterUpdate(entity);
  }
}

export default Dispute;
