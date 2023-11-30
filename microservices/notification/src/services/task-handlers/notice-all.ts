import { Api, Log } from '@lomray/microservice-helpers';
import type { Repository } from 'typeorm';
import { In } from 'typeorm';
import TaskMode from '@constants/task-mode';
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
  private currentPage = 1;

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
    this.noticeRepository = this.manager.getRepository(NoticeEntity);

    const noticeTemplate = task.notices?.find(({ params }) => params.isTemplate);

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

    await this.sendNoticeToAllUsers(task);
  }

  /**
   * Send notice to all users
   * @description Get all users count and execute task
   */
  private async sendNoticeToAllUsers(task: TaskEntity): Promise<void> {
    const usersCount = await this.getTotalUsersCount();

    try {
      await this.executeTask(task, usersCount);
    } catch (error) {
      this.lastFailTargetId = this.currentPage.toString();

      throw error;
    }
  }

  /**
   * Execute task
   * @description Send notices for all users via iteration
   * If previous run task had error - run process from last error target id (page)
   */
  protected async executeTask(
    { lastFailTargetId, mode }: TaskEntity,
    usersCount: number,
  ): Promise<void> {
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Number(lastFailTargetId) || 1;

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

      /**
       * Users that will be processed in current chunk
       */
      const processUsers: string[] = [];

      if (
        mode === TaskMode.FULL_CHECK_UP ||
        // full checkup current users chuck if last fail target id is current page
        (lastFailTargetId && this.currentPage === Number(lastFailTargetId))
      ) {
        const userIds = usersListResult.list.map(({ id }) => id);
        const sentNotices = await this.noticeRepository.find({
          select: ['userId', 'taskId'],
          where: { userId: In(userIds), taskId: this.noticeTemplate.taskId },
        });
        const notNoticedUserIds = userIds.filter(
          (userId) => !sentNotices.some(({ userId: id }) => id === userId),
        );

        // If notices exist for all current chunk users - continue to next chunk
        if (notNoticedUserIds.length === 0) {
          this.currentPage += 1;
          continue;
        }

        processUsers.push(...notNoticedUserIds);
      } else {
        processUsers.push(...usersListResult.list.map(({ id }) => id));
      }

      // Will be saved in transaction
      const savedNotices = await this.noticeRepository.save(
        processUsers.map((userId) =>
          this.noticeRepository.create({ ...this.noticeTemplate, userId }),
        ),
      );

      offset += savedNotices.length;

      // Update pagination
      this.currentPage += 1;
    } while (offset < usersCount);
  }
}

export default NoticeAll;
