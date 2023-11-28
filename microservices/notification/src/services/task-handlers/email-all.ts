import { BaseException } from '@lomray/microservice-nodejs-lib';
import TaskType from '@constants/task-type';
import TaskEntity from '@entities/task';
import Abstract from './abstract';

class EmailAll extends Abstract {
  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(tasks, ({ type }: TaskEntity) => type === TaskType.EMAIL_ALL);
  }

  /**
   * Process email all users
   */
  public process(): Promise<number> {
    throw new BaseException({
      status: 501,
      message: 'Not implemented',
    });
  }
}

export default EmailAll;
