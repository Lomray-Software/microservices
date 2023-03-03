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
  beforeInsert({ entity }: InsertEvent<FileEntityModel>): Promise<any> | void {
    entity.order = entity.order ?? 999999999;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert({ manager, entity }: InsertEvent<FileEntityModel>): void {
    void this.refreshOrderColumn(manager, entity.entityId);
    void Microservice.eventPublish(Event.FileEntityCreate, { entity });
  }

  /**
   * 1. Trigger create event
   */
  afterUpdate({ databaseEntity }: UpdateEvent<FileEntityModel>): void {
    void Microservice.eventPublish(Event.FileEntityUpdate, { entity: databaseEntity });
  }

  /**
   * 1. Trigger remove event
   */
  afterRemove({ manager, databaseEntity }: RemoveEvent<FileEntityModel>): void {
    void this.refreshOrderColumn(manager, databaseEntity.entityId);
    void Microservice.eventPublish(Event.FileEntityRemove, { entity: databaseEntity });
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
