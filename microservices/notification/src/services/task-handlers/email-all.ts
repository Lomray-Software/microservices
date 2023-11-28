import { BaseException } from '@lomray/microservice-nodejs-lib';
import { Repository } from 'typeorm';
import TaskType from '@constants/task-type';
import MessageEntity from '@entities/message';
import TaskEntity from '@entities/task';
import Abstract from './abstract';

class EmailAll extends Abstract {
  /**
   * @private
   */
  private messageRepository: Repository<MessageEntity>;

  /**
   * @protected
   */
  protected init(): void {
    this.messageRepository = this.manager.getRepository(MessageEntity);
  }

  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(
      tasks,
      ({ type, message }: TaskEntity) => type === TaskType.EMAIL_ALL && Boolean(message),
    );
  }

  /**
   * Process email all users
   */
  protected processTasks(): Promise<void> {
    throw new BaseException({
      status: 501,
      message: 'Not implemented',
    });
  }
}

export default EmailAll;
