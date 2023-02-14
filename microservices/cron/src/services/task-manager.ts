import { performance } from 'perf_hooks';
import { Log } from '@lomray/microservice-helpers';
import type { AbstractMicroservice } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import schedule from 'node-schedule';
import { getCustomRepository, getRepository, Repository } from 'typeorm';
import CONST from '@constants/index';
import TaskStatus from '@constants/task-status';
import History from '@entities/history';
import Task from '@entities/task';
import TaskRepository from '@repositories/task';

/**
 * Task manager service
 */
class TaskManager {
  /**
   * @private
   */
  protected static instance: TaskManager | null = null;

  /**
   * @protected
   */
  protected readonly ms: AbstractMicroservice;

  /**
   * Current node id
   * @protected
   */
  protected nodeId: string;

  /**
   * @protected
   */
  protected readonly taskRepository: TaskRepository;

  /**
   * @protected
   */
  protected readonly historyRepository: Repository<History>;

  /**
   * @protected
   */
  protected constructor(ms: AbstractMicroservice) {
    this.ms = ms;
    this.taskRepository = getCustomRepository(TaskRepository);
    this.historyRepository = getRepository(History);
  }

  /**
   * Init service
   */
  public static init(ms: AbstractMicroservice): TaskManager {
    if (TaskManager.instance === null) {
      TaskManager.instance = new TaskManager(ms);
    }

    return TaskManager.instance;
  }

  /**
   * Return service instance
   */
  public static get(): TaskManager {
    if (!TaskManager.instance) {
      throw new Error('Call TaskManager.init method before try to get service instance.');
    }

    return TaskManager.instance;
  }

  /**
   * Return task name
   * @protected
   */
  protected getTaskName(id: number): string {
    return ['task', id].join('-');
  }

  /**
   * Assign node id to current instance
   */
  public async assignNodeId(): Promise<void> {
    const workers = await this.ms.getWorkers();
    const instanceNumber = Math.floor((workers.length || CONST.MS_WORKERS) / CONST.MS_WORKERS);

    this.nodeId = `node${instanceNumber}`;

    Log.info(`Assigned node id: ${this.nodeId}`);
  }

  /**
   * Run cron tasks
   */
  public async run(): Promise<void> {
    const tasks = await this.taskRepository.find({ nodeId: this.nodeId });

    if (!tasks.length) {
      Log.warn(`Empty task list for current nodeId: ${this.nodeId}`);

      return;
    }

    Log.info(`Starting task manager for node: ${this.nodeId}`);

    this.runTasks(tasks);
  }

  /**
   * Stop running task
   */
  public stopTask(taskId: number): void {
    const taskName = this.getTaskName(taskId);
    const job = schedule.scheduledJobs[taskName];

    if (job) {
      schedule.cancelJob(job);

      Log.info(`Task stopped successfully: ${taskId}`);
    }
  }

  /**
   * Reschedule task
   */
  public rescheduleTask(task: Task): void {
    this.stopTask(task.id);

    if (task.nodeId === this.nodeId) {
      Log.info(`Task reschedule: ${task.id}`);

      this.runTasks([task]);
    }
  }

  /**
   * Run cron tasks
   */
  public runTasks(tasks: Task[]): void {
    if (!this.nodeId) {
      Log.warn('Trying schedule task before assign node id');

      return;
    }

    for (const { id, rule, method, payload } of tasks) {
      schedule.scheduleJob(this.getTaskName(id), rule, async () => {
        Log.info(`Start task - ${id} - ${new Date().toISOString()}: ${method}`);

        const { params, options } = payload;
        const perfNow = performance.now();
        const historyRecord = this.historyRepository.create({
          taskId: id,
          status: TaskStatus.running,
        });
        const templatedParams = JSON.parse(_.template(JSON.stringify(params || {}))() as string);

        await this.historyRepository.save(historyRecord);

        try {
          const response = await this.ms.sendRequest(method, templatedParams, options);

          if (response.getError()) {
            throw response.getError();
          }

          historyRecord.status = TaskStatus.success;
          historyRecord.response = response.getResult() ?? {};
        } catch (e) {
          Log.error(`Error task - ${id}: ${method} --> ${e as string}`);

          historyRecord.status = TaskStatus.error;
          historyRecord.response = { ...e, message: e.message };
        } finally {
          historyRecord.executionTime = Number((performance.now() - perfNow).toFixed(2));
        }

        await this.historyRepository.save(historyRecord);

        Log.info(`End task - ${id}: ${method} execution time: ${historyRecord.executionTime}`);
      });
    }

    Log.info(`Scheduled tasks: ${tasks.length}.`);
  }
}

export default TaskManager;
