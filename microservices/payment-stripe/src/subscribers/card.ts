import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import CardEntity from '@entities/card';
import CustomerService from '@services/customer';

@EventSubscriber()
class Card implements EntitySubscriberInterface<CardEntity> {
  /**
   * This subscriber only for card entity
   */
  public listenTo(): typeof CardEntity {
    return CardEntity;
  }

  /**
   * Handles card creation
   */
  public async afterInsert({ entity, manager }: InsertEvent<CardEntity>): Promise<void> {
    await CustomerService.handlePaymentMethod(entity, manager);
  }

  /**
   * Handles card update
   */
  public async afterUpdate({ entity, manager }: UpdateEvent<CardEntity>): Promise<void> {
    await CustomerService.handlePaymentMethod(entity as CardEntity, manager);
  }

  /**
   * Handles card remove
   */
  public async afterRemove({ databaseEntity, manager }: RemoveEvent<CardEntity>): Promise<void> {
    await CustomerService.handlePaymentMethod(databaseEntity, manager);
  }
}

export default Card;
