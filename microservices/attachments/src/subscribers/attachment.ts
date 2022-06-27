import { Microservice } from '@lomray/microservice-nodejs-lib';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntityManager, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import Event from '@constants/event';
import AttachmentModel from '@entities/attachment';
import AttachmentEntity from '@entities/attachment-entity';

@EventSubscriber()
class Attachment implements EntitySubscriberInterface<AttachmentModel> {
  /**
   * This subscriber only for attachment entity
   */
  listenTo(): typeof AttachmentModel {
    return AttachmentModel;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert(event: InsertEvent<AttachmentModel>): void {
    void Microservice.eventPublish(Event.AttachmentCreate, { entity: event.entity });
  }

  /**
   * 1. Trigger create event
   */
  afterUpdate(event: UpdateEvent<AttachmentModel>): void {
    void Microservice.eventPublish(Event.AttachmentUpdate, { entity: event.databaseEntity });
  }

  /**
   * Get relation entities for pass full attachment data to event
   */
  async beforeRemove({ entity, manager }: RemoveEvent<AttachmentModel>): Promise<void> {
    if (!entity) {
      return;
    }

    entity.attachmentEntities = await Attachment.getRelations(manager, entity.id);
  }

  /**
   * 1. Trigger remove event
   */
  afterRemove(event: RemoveEvent<AttachmentModel>): void {
    void Microservice.eventPublish(Event.AttachmentRemove, { entity: event.databaseEntity });
  }

  /**
   * Get attachments entities
   * @private
   */
  private static getRelations(
    manager: EntityManager,
    attachmentId: string,
  ): Promise<AttachmentEntity[]> {
    return manager.getRepository(AttachmentEntity).find({ attachmentId });
  }
}

export default Attachment;
