import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import BankAccountEntity from '@entities/bank-account';
import BankAccountService from '@services/bank-account';

/**
 * Bank account subscriber
 */
@EventSubscriber()
class BankAccount implements EntitySubscriberInterface<BankAccountEntity> {
  /**
   * This subscriber only for bank account entity
   */
  public listenTo(): typeof BankAccountEntity {
    return BankAccountEntity;
  }

  /**
   * Handle bank account create
   */
  public async afterInsert({ entity, manager }: InsertEvent<BankAccountEntity>): Promise<void> {
    await BankAccountService.handleCreate(entity, manager);
  }

  /**
   * Handle bank account update
   */
  public async afterUpdate({
    entity,
    databaseEntity,
  }: UpdateEvent<BankAccountEntity>): Promise<void> {
    await BankAccountService.handleUpdate(databaseEntity, entity as BankAccountEntity);
  }
}

export default BankAccount;
