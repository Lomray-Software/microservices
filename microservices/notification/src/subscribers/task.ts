import type { InsertEvent, EntitySubscriberInterface } from 'typeorm';
import { EventSubscriber } from 'typeorm';
import TaskEntity from '@entities/task';
import TaskService from '@services/task';

@EventSubscriber()
class Task implements EntitySubscriberInterface<TaskEntity> {
  /**
   * This subscriber only for Task entity
   */
  public listenTo(): typeof TaskEntity {
    return TaskEntity;
  }

  /**
   * Handles event: after insert
   */
  public async afterInsert({ entity, manager }: InsertEvent<TaskEntity>): Promise<void> {
    await TaskService.handleAfterInsert(entity, manager);
  }
}

export default Task;
