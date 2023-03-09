import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/notifications';
import type { InsertEvent, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { EventSubscriber } from 'typeorm';
import NoticeEntity from '@entities/notice';

@EventSubscriber()
class Notice implements EntitySubscriberInterface<NoticeEntity> {
  /**
   * This subscriber only for notice entity
   */
  public listenTo(): typeof NoticeEntity {
    return NoticeEntity;
  }

  /**
   * 1. Send event
   */
  public afterInsert({ entity }: InsertEvent<NoticeEntity>): Promise<void> | void {
    void Microservice.eventPublish(Event.NotifyCreate, { entity });
  }

  /**
   * 1. Send event
   */
  public afterUpdate({ entity }: UpdateEvent<NoticeEntity>): Promise<void> | void {
    void Microservice.eventPublish(Event.NotifyUpdate, { entity });
  }
}

export default Notice;
