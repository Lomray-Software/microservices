import { Batch } from '@lomray/microservice-helpers';
import { EntityManager, getManager } from 'typeorm';
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

    await Batch.find(taskRepository.createQueryBuilder('t'), (tasks) => this.process(tasks));

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
