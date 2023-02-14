import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/files';
import type { InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { EntityManager, EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import FileModel from '@entities/file';
import FileEntity from '@entities/file-entity';

@EventSubscriber()
class File implements EntitySubscriberInterface<FileModel> {
  /**
   * This subscriber only for file entity
   */
  listenTo(): typeof FileModel {
    return FileModel;
  }

  /**
   * 1. Trigger create event
   */
  afterInsert(event: InsertEvent<FileModel>): void {
    void Microservice.eventPublish(Event.FileCreate, { entity: event.entity });
  }

  /**
   * 1. Trigger create event
   */
  afterUpdate(event: UpdateEvent<FileModel>): void {
    void Microservice.eventPublish(Event.FileUpdate, { entity: event.databaseEntity });
  }

  /**
   * Get relation entities for pass full file data to event
   */
  async beforeRemove({ entity, manager }: RemoveEvent<FileModel>): Promise<void> {
    if (!entity) {
      return;
    }

    entity.fileEntities = await File.getRelations(manager, entity.id);
  }

  /**
   * 1. Trigger remove event
   */
  afterRemove(event: RemoveEvent<FileModel>): void {
    void Microservice.eventPublish(Event.FileRemove, {
      entity: { ...event.databaseEntity, ...event.entity },
    });
  }

  /**
   * Get file entities
   * @private
   */
  private static getRelations(manager: EntityManager, fileId: string): Promise<FileEntity[]> {
    return manager.getRepository(FileEntity).find({ fileId });
  }
}

export default File;
