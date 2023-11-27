import TaskType from '@constants/task-type';
import Abstract from './abstract';
import EmailAll from './email-all';
import NoticeAll from './notice-all';

/**
 * Notify task factory
 * @description Call this factory in job for processing notify tasks
 */
class Factory {
  /**
   * Create notify task
   */
  public static create(notifyTaskType: TaskType): Abstract {
    switch (notifyTaskType) {
      case TaskType.NOTICE_ALL:
        return new NoticeAll();

      case TaskType.EMAIL_ALL:
        return new EmailAll();

      default:
        throw new Error(`Unknown notify type: ${notifyTaskType as string}`);
    }
  }
}

export default Factory;
