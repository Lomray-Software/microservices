import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/files';
import type {
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
  EntityManager,
  EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber, getCustomRepository } from 'typeorm';
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
  async afterInsert({ entity, manager }: InsertEvent<FileEntityModel>): Promise<void> {
    await this.refreshOrderColumn(manager, entity.entityId);
    void Microservice.eventPublish(Event.FileEntityCreate, { entity });
  }

  /**
   * 1. Trigger update event
   */
  afterUpdate({ databaseEntity }: UpdateEvent<FileEntityModel>): void {
    void Microservice.eventPublish(Event.FileEntityUpdate, { entity: databaseEntity });
  }

  /**
   * 1. Trigger remove event
   */
  async afterRemove({ databaseEntity, manager }: RemoveEvent<FileEntityModel>): Promise<void> {
    await this.refreshOrderColumn(manager, databaseEntity.entityId);
    void Microservice.eventPublish(Event.FileEntityRemove, { entity: databaseEntity });
  }

  /**
   * Resort file entities
   * @protected
   */
  protected refreshOrderColumn(manager: EntityManager, entityId: string): Promise<void> {
    return getCustomRepository(FileEntityRepository).refreshOrder(entityId, manager);
  }
}

export default FileEntity;
