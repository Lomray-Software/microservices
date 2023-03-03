import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/files';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntitySubscriberInterface, EventSubscriber, getCustomRepository } from 'typeorm';
import FileEntityModel from '@entities/file-entity';
import FileEntityRepository from '@repositories/file-entity';

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
  afterInsert({ entity }: InsertEvent<FileEntityModel>): void {
    void this.refreshOrderColumn(entity.entityId);
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
  afterRemove({ databaseEntity }: RemoveEvent<FileEntityModel>): void {
    void this.refreshOrderColumn(databaseEntity.entityId);
    void Microservice.eventPublish(Event.FileEntityRemove, { entity: databaseEntity });
  }

  /**
   * Resort file entities
   * @protected
   */
  protected refreshOrderColumn(entityId: string): Promise<void> {
    return getCustomRepository(FileEntityRepository).refreshOrder(entityId);
  }
}

export default FileEntity;
