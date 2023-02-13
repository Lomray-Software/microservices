import type { InsertEvent, RemoveEvent, UpdateEvent, EntitySubscriberInterface } from 'typeorm';
import { EventSubscriber } from 'typeorm';
import TaskEntity from '@entities/task';
import TaskManager from '@services/task-manager';

@EventSubscriber()
class Task implements EntitySubscriberInterface<TaskEntity> {
  /**
   * This subscriber only for Task entity
   */
  public listenTo(): typeof TaskEntity {
    return TaskEntity;
  }

  /**
   * Schedule new task
   */
  public afterInsert({ entity }: InsertEvent<TaskEntity>): Promise<any> | void {
    TaskManager.get().runTasks([entity]);
  }

  /**
   * Cancel scheduled task
   */
  public afterRemove({ databaseEntity }: RemoveEvent<TaskEntity>): Promise<any> | void {
    TaskManager.get().stopTask(databaseEntity.id);
  }

  /**
   * Reschedule task
   */
  public afterUpdate({ databaseEntity }: UpdateEvent<TaskEntity>): Promise<void> | void {
    TaskManager.get().rescheduleTask(databaseEntity);
  }
}

export default Task;
