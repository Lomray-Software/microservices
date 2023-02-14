import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/files';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntityManager, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import FileEntityModel from '@entities/file-entity';

@EventSubscriber()
class FileEntity implements EntitySubscriberInterface<FileEntityModel> {
  /**
   * This subscriber only for file entity
   */
  listenTo(): typeof FileEntityModel {
    return FileEntityModel;
  }

  /**
   * 1. Manage "order" field, put new entity at end (this field will be updated after insert)
   */
  beforeInsert(event: InsertEvent<FileEntityModel>): Promise<any> | void {
    event.entity.order = event.entity.order ?? 999999999;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert(event: InsertEvent<FileEntityModel>): void {
    void this.refreshOrderColumn(event.manager, event.entity.entityId);
    void Microservice.eventPublish(Event.FileEntityCreate, { entity: event.entity });
  }

  /**
   * 1. Trigger create event
   */
  afterUpdate(event: UpdateEvent<FileEntityModel>): void {
    void Microservice.eventPublish(Event.FileEntityUpdate, { entity: event.databaseEntity });
  }

  /**
   * 1. Trigger remove event
   */
  afterRemove(event: RemoveEvent<FileEntityModel>): void {
    void Microservice.eventPublish(Event.FileEntityRemove, { entity: event.databaseEntity });
  }

  /**
   * Resort file entities
   * @protected
   */
  protected refreshOrderColumn(manager: EntityManager, entityId: string): Promise<void> {
    const { tableName } = manager.getRepository(FileEntityModel).metadata;

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

export default FileEntity;
