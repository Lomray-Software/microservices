import { Microservice } from '@lomray/microservice-nodejs-lib';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntityManager, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
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
   * 1. Manage "order" field, put new entity at end (this field will be updated after insert)
   */
  beforeInsert(event: InsertEvent<AttachmentEntityModel>): Promise<any> | void {
    event.entity.order = event.entity.order ?? 999999999;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert(event: InsertEvent<AttachmentEntityModel>): void {
    void this.refreshOrderColumn(event.manager, event.entity.entityId);
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

  /**
   * Resort attachment entities
   * @protected
   */
  protected refreshOrderColumn(manager: EntityManager, entityId: string): Promise<void> {
    const { tableName } = manager.getRepository(AttachmentEntityModel).metadata;

    return manager.query(
      `
        UPDATE ${tableName}
        SET "order" = c.counter
        FROM
            (
                SELECT row_number() over (order by a."order", a."createdAt" DESC) AS counter, a."id" as rowId
                FROM ${tableName} a
                WHERE a."entityId" = $1
            ) AS c
        WHERE "id" = c.rowId
    `,
      [entityId],
    );
  }
}

export default AttachmentEntity;
