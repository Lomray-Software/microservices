import { Api, Log } from '@lomray/microservice-helpers';
import { Repository } from 'typeorm';
import TaskType from '@constants/task-type';
import NoticeEntity from '@entities/notice';
import TaskEntity from '@entities/task';
import Abstract from './abstract';

class NoticeAll extends Abstract {
  /**
   * @private
   */
  private noticeRepository: Repository<NoticeEntity>;

  /**
   * @private
   */
  private currentPage = 0;

  /**
   * @protected
   */
  protected init(): void {
    this.noticeRepository = this.manager.getRepository(NoticeEntity);
  }

  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(tasks, ({ type }: TaskEntity) => type === TaskType.NOTICE_ALL);
  }

  /**
   * Process notice all users
   */
  protected async processTasks(task: TaskEntity): Promise<void> {
    const taskTransactionRepository = this.manager.getRepository(TaskEntity);

    /**
     * Get task entity with notice template
     */
    const entity = await taskTransactionRepository.findOne(task.id, { relations: ['notice'] });

    if (!entity) {
      // Internal error
      throw new Error('Task not found.');
    }

    if (!entity.notice) {
      // Internal error
      throw new Error('Task notice not found.');
    }

    await this.handleSend(entity);
  }

  /**
   * Handle send
   */
  private async handleSend(task: TaskEntity): Promise<void> {
    const { result: usersCountResult, error: usersCountError } = await Api.get().users.user.count();

    if (usersCountError) {
      // Case where error target doesn't exist
      throw new Error('Failed to send group notice. Unable to retrieve users count.');
    }

    try {
      await this.send(task, usersCountResult!.count);
    } catch (error) {
      this.lastFailTargetId = this.currentPage.toString();

      throw error;
    }
  }

  /**
   * Send
   */
  private async send({ notice, lastFailTargetId }: TaskEntity, usersCount: number): Promise<void> {
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Math.floor(offset / this.chunkSize) + (Number(lastFailTargetId) || 1);

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
      if (!usersListResult?.list) {
        return;
      }

      const personalNotices: NoticeEntity[] = [];

      usersListResult.list.forEach(({ id: userId }) => {
        personalNotices.push(this.noticeRepository.create({ ...notice, userId }));
      });

      // Will be saved in transaction
      await this.noticeRepository.save(personalNotices);

      offset += personalNotices.length;
    } while (offset < usersCount);
  }
}

export default NoticeAll;
