import TaskType from '@constants/task-type';
import TaskEntity from '@entities/task';
import Abstract from './abstract';

class NoticeAll extends Abstract {
  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(tasks, ({ type }: TaskEntity) => type === TaskType.NOTICE_ALL);
  }

  /**
   * Process notice all users
   */
  public process(): Promise<number> {
    return Promise.resolve(1);
  }
}

export default NoticeAll;
