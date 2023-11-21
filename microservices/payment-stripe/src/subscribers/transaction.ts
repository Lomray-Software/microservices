import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import TransactionEntity from '@entities/transaction';
import TransactionService from '@services/transaction';

/**
 * Transaction subscriber
 */
@EventSubscriber()
class Transaction implements EntitySubscriberInterface<TransactionEntity> {
  /**
   * This subscriber only for Transaction entity
   */
  public listenTo(): typeof TransactionEntity {
    return TransactionEntity;
  }

  /**
   * Handle Transaction event: after insert
   */
  public async afterInsert({ entity }: InsertEvent<TransactionEntity>): Promise<void> {
    await TransactionService.handleAfterCreate(entity);
  }

  /**
   * Handle Transaction event: after update
   */
  public async afterUpdate({ entity }: UpdateEvent<TransactionEntity>): Promise<void> {
    if (!entity) {
      return;
    }

    await TransactionService.handleAfterUpdate(entity as TransactionEntity);
  }
}

export default Transaction;
