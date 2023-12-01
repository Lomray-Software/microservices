import { Api, Log } from '@lomray/microservice-helpers';
import { JQOperator } from '@lomray/microservices-types';
import _ from 'lodash';
import { EntityManager, Repository } from 'typeorm';
import TaskStatus from '@constants/task-status';
import Message from '@entities/message';
import TaskEntity from '@entities/task';
import type IHandledCounts from '@interfaces/handled-counts';

/**
 * Abstract class for tasks processing
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected handledCounts: IHandledCounts = { total: 0, completed: 0, failed: 0 };

  /**
   * @protected
   */
  protected lastFailTargetId: string | null = null;

  /**
   * @protected
   */
  protected readonly chunkSize = 50;

  /**
   * @protected
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
   * @description Prepare data for execution
   */
  protected abstract processTasks(task: TaskEntity): Promise<void>;

  /**
   * Grab related tasks
   */
  public take(tasks: TaskEntity[], conditionCallback?: (task: TaskEntity) => boolean): boolean {
    if (typeof conditionCallback !== 'function') {
      return false;
    }

    _.remove(tasks, (task) => {
      if (!conditionCallback(task)) {
        return false;
      }

      this.tasks.push(task);

      return true;
    });

    return this.tasks.length > 0;
  }

  /**
   * Process execution of grabbed tasks
   */
  public async process(): Promise<IHandledCounts> {
    if (!this.tasks.length) {
      return this.handledCounts;
    }

    for (const task of this.tasks) {
      try {
        this.resetState();
        await this.updateWaitingTask(task.id);

        /**
         * Process task goal
         */
        await this.processTasks(task);

        /**
         * Sequence required
         */
        await this.updateCompletedTask(task.id);
      } catch (error) {
        Log.error(
          `Failed to handle task: "${task.id}", type "${task.type}". ${error?.message as string}`,
        );

        await this.updateFailedTask(task.id, error?.message as string);
      }
    }

    return this.handledCounts;
  }

  /**
   * Check is message template valid
   */
  protected checkIsMessageTemplateValid(template: Partial<Message>): boolean {
    return !(!template.text || !template.subject || !template.html || !template.taskId);
  }

  /**
   * Get total users count
   * @description Users without email - facebook users that does not give access for their email
   */
  protected async getTotalUsersCount(excludeUsersWithoutEmail = false): Promise<number> {
    const { result: usersCountResult, error: usersCountError } = await Api.get().users.user.count(
      excludeUsersWithoutEmail
        ? {
            query: {
              where: {
                email: {
                  [JQOperator.isNotNULL]: null,
                },
              },
            },
          }
        : undefined,
    );

    if (usersCountError) {
      // Internal error. Case where error target doesn't exist
      throw new Error('Unable to retrieve total users count.');
    }

    return usersCountResult!.count;
  }

  /**
   * Update task status to completed
   */
  private async updateCompletedTask(taskId: string): Promise<void> {
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.COMPLETED);

    lastUpdatedTask.status = TaskStatus.COMPLETED;

    await this.taskRepository.save(lastUpdatedTask);

    // Update completed tasks count
    this.handledCounts.completed += 1;
  }

  /**
   * Update failed task data
   */
  private async updateFailedTask(taskId: string, errorMessage: string): Promise<void> {
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.FAILED);

    lastUpdatedTask.status = TaskStatus.FAILED;
    lastUpdatedTask.params.lastErrorMessage = errorMessage;

    if (!this.lastFailTargetId) {
      // If task fail before execution process
      Log.error(
        `Task failed before execution process: "${lastUpdatedTask.id}", type "${lastUpdatedTask.type}".`,
      );
    } else {
      /**
       * If task failed during execution process and then failed before execution process.
       * DO NOT rewrite target reference
       * @description Case: failed to get user page 2, then failed to start send process at all
       */
      lastUpdatedTask.lastFailTargetId = this.lastFailTargetId;
    }

    await this.taskRepository.save(lastUpdatedTask);

    // Update failed tasks count
    this.handledCounts.failed += 1;
  }

  /**
   * Update processing task data
   */
  private async updateWaitingTask(taskId: string): Promise<void> {
    const lastUpdatedTask = await this.getLastUpdatedTaskVersion(taskId, TaskStatus.WAITING);

    lastUpdatedTask.status = TaskStatus.WAITING;

    await this.taskRepository.save(lastUpdatedTask);

    // Update total handled tasks count
    this.handledCounts.total += 1;
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
