import { Microservice } from '@lomray/microservice-nodejs-lib';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import Event from '@constants/event';
import AttachmentEntityModel from '@entities/attachment-entity';

@EventSubscriber()
class AttachmentEntity implements EntitySubscriberInterface<AttachmentEntityModel> {
  /**
   * This subscriber only for attachment entity
   */
  listenTo(): typeof AttachmentEntityModel {
    return AttachmentEntityModel;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert(event: InsertEvent<AttachmentEntityModel>): void {
    void Microservice.eventPublish(Event.AttachmentEntityCreate, { entity: event.entity });
  }

  /**
   * 1. Trigger create event
   */
  afterUpdate(event: UpdateEvent<AttachmentEntityModel>): void {
    void Microservice.eventPublish(Event.AttachmentEntityUpdate, { entity: event.databaseEntity });
  }

  /**
   * 1. Trigger remove event
   */
  afterRemove(event: RemoveEvent<AttachmentEntityModel>): void {
    void Microservice.eventPublish(Event.AttachmentEntityRemove, { entity: event.databaseEntity });
  }
}

export default AttachmentEntity;
