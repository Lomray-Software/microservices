import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import TransactionEntity from '@entities/transaction';
import TransactionRepository from '@repositories/transaction';
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
  public async afterUpdate({
    entity,
    databaseEntity,
    manager,
    updatedColumns,
  }: UpdateEvent<TransactionEntity>): Promise<void> {
    if (!TransactionRepository.getIsEntityTransaction(entity)) {
      return;
    }

    await TransactionService.handleAfterUpdate(entity, databaseEntity, manager, updatedColumns);
  }
}

export default Transaction;
