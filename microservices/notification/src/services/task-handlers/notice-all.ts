import { Api, Log } from '@lomray/microservice-helpers';
import type { Repository } from 'typeorm';
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
  private noticeTemplate: Partial<NoticeEntity>;

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
      ({ type, notices }: TaskEntity) =>
        type === TaskType.NOTICE_ALL && notices.some(({ params }) => params.isTemplate),
    );
  }

  /**
   * Process notice all users
   */
  protected async processTasks(task: TaskEntity): Promise<void> {
    this.noticeRepository = this.manager.getRepository(NoticeEntity);

    const noticeTemplate = task.notices.find(({ params }) => params.isTemplate);

    if (!noticeTemplate) {
      // Internal error
      throw new Error('Task notice template was not found.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = noticeTemplate;

    this.noticeTemplate = {
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
      const savedNotices = await this.noticeRepository.save(
        usersListResult.list.map(({ id: userId }) =>
          this.noticeRepository.create({ ...this.noticeTemplate, userId }),
        ),
      );

      offset += savedNotices.length;

      // Update pagination
      this.currentPage = Math.floor(offset / this.chunkSize) + initPage;
    } while (offset < usersCount);
  }
}

export default NoticeAll;
