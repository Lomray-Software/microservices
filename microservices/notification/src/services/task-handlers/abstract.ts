import { Log } from '@lomray/microservice-helpers';
import _ from 'lodash';
import { EntityManager, Repository } from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskEntity from '@entities/task';

/**
 * Abstract class for notify tasks
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected handledTasksCount = 0;

  /**
   * @protected
   */
  protected lastFailTargetId: string | null = null;

  /**
   * Tasks
   */
  protected readonly chunkSize = 50;

  /**
   * Tasks
   */
  protected readonly tasks: TaskEntity[] = [];

  /**
   * @protected
   */
  protected readonly taskRepository: Repository<TaskEntity>;

  /**
   * @protected
   */
  protected readonly manager: EntityManager;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.taskRepository = manager.getRepository(TaskEntity);
  }

  /**
   * Process notify tasks
   */
  protected abstract processTasks(task: TaskEntity): Promise<void>;

  /**
   * Get and handle events
   */
  public take(events: TaskEntity[], conditionCallback?: (event: TaskEntity) => boolean): boolean {
    if (!conditionCallback) {
      return false;
    }

    _.remove(events, (event) => {
      if (!conditionCallback(event)) {
        return false;
      }

      this.tasks.push(event);

      return true;
    });

    return this.tasks.length > 0;
  }

  /**
   * Process payment orders
   */
  public async process(): Promise<number> {
    if (!this.tasks.length) {
      return this.handledTasksCount;
    }

    for (const task of this.tasks) {
      try {
        this.resetState();
        await this.updateWaitingTask(task);

        /**
         * Process task goal
         */
        await this.processTasks(task);

        this.handledTasksCount += 1;

        await this.updateCompletedTask(task.id);
      } catch (error) {
        Log.error(
          `Failed to handle task: "${task.id}", type "${task.type}". ${error?.message as string}`,
        );

        await this.updateFailedTask(task.id, error?.message as string);
      }
    }

    return this.handledTasksCount;
  }

  /**
   * Update task
   */
  private async updateCompletedTask(taskId: string): Promise<void> {
    // Get last task version. Prevent remove related notices that were created in process
    const updatedTask = await this.taskRepository.findOne(taskId);

    if (!updatedTask) {
      throw new Error('Failed to update task status to "completed". Task was not found.');
    }

    updatedTask.status = TaskStatus.COMPLETED;

    await this.taskRepository.save(updatedTask);
  }

  /**
   * Update failed task data
   */
  private async updateFailedTask(taskId: string, errorMessage: string): Promise<void> {
    // Get last task version. Prevent remove related notices that were created in process
    const updatedTask = await this.taskRepository.findOne(taskId);

    if (!updatedTask) {
      throw new Error('Failed to update task status to "failed". Task was not found.');
    }

    updatedTask.status = TaskStatus.FAILED;
    updatedTask.lastFailTargetId = this.lastFailTargetId;

    // If task fail before execution process
    if (!this.lastFailTargetId) {
      Log.error(
        `Task failed before execution process: "${updatedTask.id}", type "${updatedTask.type}"`,
      );

      updatedTask.params.lastErrorMessage = errorMessage;
    }

    await this.taskRepository.save(updatedTask);
  }

  /**
   * Update processing task data
   */
  private async updateWaitingTask(task: TaskEntity): Promise<void> {
    task.status = TaskStatus.WAITING;

    await this.taskRepository.save(task);
  }

  /**
   * Reset state
   */
  private resetState() {
    this.lastFailTargetId = null;
  }
}

export default Abstract;
