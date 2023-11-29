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

    await this.handleProcessTaskExecution(task);
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

      /**
       * Users that will be processed in current chunk
       */
      const processUsers: string[] = [];

      if (mode === TaskMode.FULL_CHECK_UP) {
        /**
         * If full microservices will down - task SHOULD NOT be executed again
         * for the same users. So, we need to check if notices exist for these users.
         * In this case Last Error Target may not saved
         */
        const userIds = usersListResult.list.map(({ id }) => id);
        const existingNotices = await this.noticeRepository.find({
          select: ['userId', 'taskId'],
          where: { userId: In(userIds), taskId: this.noticeTemplate.taskId },
        });

        const notNoticedUserIds = userIds.filter(
          (userId) => !existingNotices.some(({ userId: id }) => id === userId),
        );

        /**
         * If notices exist for all current chunk users - continue to next chunk
         */
        if (notNoticedUserIds.length === this.chunkSize) {
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
      this.currentPage = Math.floor(offset / this.chunkSize) + initPage;
    } while (offset < usersCount);
  }
}

export default NoticeAll;
