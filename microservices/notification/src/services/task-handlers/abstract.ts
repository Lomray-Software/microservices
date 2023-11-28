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
        await this.updateWaitingTask(task.id);

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
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.COMPLETED);

    lastUpdatedTask.status = TaskStatus.COMPLETED;

    await this.taskRepository.save(lastUpdatedTask);
  }

  /**
   * Update failed task data
   */
  private async updateFailedTask(taskId: string, errorMessage: string): Promise<void> {
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.FAILED);

    lastUpdatedTask.status = TaskStatus.FAILED;
    lastUpdatedTask.lastFailTargetId = this.lastFailTargetId;

    // If task fail before execution process
    if (!this.lastFailTargetId) {
      Log.error(
        `Task failed before execution process: "${lastUpdatedTask.id}", type "${lastUpdatedTask.type}"`,
      );

      lastUpdatedTask.params.lastErrorMessage = errorMessage;
    }

    await this.taskRepository.save(lastUpdatedTask);
  }

  /**
   * Update processing task data
   */
  private async updateWaitingTask(taskId: string): Promise<void> {
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.WAITING);

    lastUpdatedTask.status = TaskStatus.WAITING;

    await this.taskRepository.save(lastUpdatedTask);
  }

  /**
   * Returns last task version
   */
  private async getLastUpdatedTaskVersion(
    taskId: string,
    updateStatus: string,
  ): Promise<TaskEntity> {
    // Get last task version. Prevent remove related notices that were created in process
    const lastUpdatedTask = await this.taskRepository.findOne(taskId);

    if (!lastUpdatedTask) {
      throw new Error(`Failed to update task status to "${updateStatus}". Task was not found.`);
    }

    return lastUpdatedTask;
  }

  /**
   * Reset state
   */
  private resetState(): void {
    this.lastFailTargetId = null;
  }
}

export default Abstract;
