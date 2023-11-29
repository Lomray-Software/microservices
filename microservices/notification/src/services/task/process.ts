import { Batch } from '@lomray/microservice-helpers';
import { EntityManager, getManager } from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskEntity from '@entities/task';
import type IHandledCounts from '@interfaces/handled-counts';
import Factory from '@services/task-handlers/factory';

class Process {
  /**
   * @private
   */
  private handledCounts: IHandledCounts = { total: 0, failed: 0, completed: 0 };

  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @constructor
   */
  private constructor() {
    this.manager = getManager();
  }

  /**
   * Init service
   */
  public static init(): Process {
    return new Process();
  }

  /**
   * Handles process start
   */
  public async retrieveAndProcessTasks(): Promise<IHandledCounts> {
    const taskRepository = this.manager.getRepository(TaskEntity);

    await Batch.find(
      taskRepository
        .createQueryBuilder('task')
        .where('task.status IN (:...statuses)', { statuses: [TaskStatus.INIT, TaskStatus.FAILED] })
        .leftJoinAndSelect(
          'task.notices',
          'notices',
          "(notices.params ->> 'isTemplate')::boolean = true",
        )
        .leftJoinAndSelect(
          'task.messages',
          'messages',
          "(messages.params ->> 'isTemplate')::boolean = true",
        ),
      (tasks) => this.process(tasks),
      {
        chunkSize: 3,
      },
    );

    return this.handledCounts;
  }

  /**
   * Process handle tasks
   */
  private async process(tasks: TaskEntity[]): Promise<void> {
    if (!tasks.length) {
      return;
    }

    this.handledCounts = await Factory.process(tasks);
  }
}

export default Process;
