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
   * Init (prebuild services requirements)
   */
  protected abstract init(): Promise<void> | void;

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

        await this.updateCompletedTask(task);
      } catch (error) {
        Log.error(
          `Failed to handle task: "${task.id}", type "${task.type}". ${error?.message as string}`,
        );

        await this.updateFailedTask(task, error?.message as string);
      }
    }

    return this.handledTasksCount;
  }

  /**
   * Update task
   */
  private async updateCompletedTask(task: TaskEntity): Promise<void> {
    task.status = TaskStatus.COMPLETED;

    await this.taskRepository.save(task);
  }

  /**
   * Update failed task data
   */
  private async updateFailedTask(task: TaskEntity, errorMessage: string): Promise<void> {
    // If task fail before execution process
    if (!this.lastFailTargetId) {
      Log.error(`Task failed before execution process: "${task.id}", type "${task.type}"`);

      return;
    }

    task.params.lastErrorMessage = errorMessage;
    task.lastFailTargetId = this.lastFailTargetId;
    task.status = TaskStatus.FAILED;

    await this.taskRepository.save(task);
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
