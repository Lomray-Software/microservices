import { Batch } from '@lomray/microservice-helpers';
import { EntityManager, getManager } from 'typeorm';
import TaskStatus from '@constants/task-status';
import TaskEntity from '@entities/task';
import Factory from '@services/task-handlers/factory';

class Process {
  /**
   * @private
   */
  private handledTasksCount = 0;

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
  public async checkoutAndProcess(): Promise<number> {
    const taskRepository = this.manager.getRepository(TaskEntity);

    await Batch.find(
      taskRepository
        .createQueryBuilder('task')
        .where('task.status IN (:...statuses)', { statuses: [TaskStatus.INIT, TaskStatus.FAILED] })
        .leftJoinAndSelect('task.notice', 'notice')
        .leftJoinAndSelect('task.message', 'message'),
      (tasks) => this.process(tasks),
      {
        chunkSize: 3,
      },
    );

    return this.handledTasksCount;
  }

  /**
   * Process handle tasks
   */
  private async process(tasks: TaskEntity[]): Promise<void> {
    if (!tasks.length) {
      return;
    }

    this.handledTasksCount += await Factory.process(tasks);
  }
}

export default Process;
