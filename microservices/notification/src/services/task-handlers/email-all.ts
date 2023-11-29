import { Api, Log } from '@lomray/microservice-helpers';
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
   * @private
   */
  private messageTemplate: Partial<MessageEntity>;

  /**
   * @private
   */
  private currentPage = 0;

  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(
      tasks,
      ({ type, messages }: TaskEntity) =>
        type === TaskType.EMAIL_ALL && messages.some(({ params }) => params.isTemplate),
    );
  }

  /**
   * Process email all users
   */
  protected async processTasks(task: TaskEntity): Promise<void> {
    this.messageRepository = this.manager.getRepository(MessageEntity);

    const messageTemplate = task.messages.find(({ params }) => params.isTemplate);

    if (!messageTemplate) {
      // Internal error
      throw new Error('Task message template was not found.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = messageTemplate;

    this.messageTemplate = {
      ...rest,
      params: { ...rest.params, isTemplate: false },
    };

    await this.handleSend(task);
  }

  /**
   * Handle send
   * @description Get all users count and handle send errors
   */
  private async handleSend(task: TaskEntity): Promise<void> {
    const usersCount = await this.getTotalUsersCount();

    try {
      await this.send(task, usersCount);
    } catch (error) {
      this.lastFailTargetId = this.currentPage.toString();

      throw error;
    }
  }

  /**
   * Send
   * @description Send notices for all users via iteration
   * If previous run task had error - run process from last error target id (page)
   */
  private async send({ lastFailTargetId }: TaskEntity, usersCount: number): Promise<void> {
    const initPage = Number(lastFailTargetId) || 1;
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Math.floor(offset / this.chunkSize) + initPage;

    do {
      const { result: usersListResult, error: usersListError } = await Api.get().users.user.list({
        query: {
          attributes: ['id', 'createdAt'],
          page: this.currentPage,
          pageSize: this.chunkSize,
          orderBy: { createdAt: 'ASC' },
        },
      });

      if (usersListError) {
        Log.error(usersListError.message);

        throw new Error(usersListError.message);
      }

      // If all users were iterated - task done
      if (!usersListResult?.list.length) {
        return;
      }

      // Will be saved in transaction
      const savedNotices = await this.messageRepository.save(
        usersListResult.list.map(({ id: userId }) =>
          this.messageRepository.create({ ...this.messageRepository, userId }),
        ),
      );

      offset += savedNotices.length;

      // Update pagination
      this.currentPage = Math.floor(offset / this.chunkSize) + initPage;
    } while (offset < usersCount);
  }
}

export default EmailAll;
