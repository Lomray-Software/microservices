import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  RemoveEvent,
  InsertEvent,
} from 'typeorm';
import CardEntity from '@entities/card';
import CardService from '@services/card';

/**
 * Card subscriber
 */
@EventSubscriber()
class Card implements EntitySubscriberInterface<CardEntity> {
  /**
   * This subscriber only for card entity
   */
  public listenTo(): typeof CardEntity {
    return CardEntity;
  }

  /**
   * Handle card create
   */
  public async afterInsert({ entity, manager }: InsertEvent<CardEntity>): Promise<void> {
    await CardService.handleCreate(entity, manager);
  }

  /**
   * Handle card update
   */
  public async afterUpdate({
    databaseEntity,
    entity,
    manager,
  }: UpdateEvent<CardEntity>): Promise<void> {
    await CardService.handleUpdate(databaseEntity, entity as CardEntity, manager);
  }

  /**
   * Handle card remove
   */
  public async beforeRemove({
    databaseEntity,
    manager,
    queryRunner,
  }: RemoveEvent<CardEntity>): Promise<void> {
    await CardService.handleRemove(databaseEntity, manager, queryRunner);
  }
}

export default Card;
