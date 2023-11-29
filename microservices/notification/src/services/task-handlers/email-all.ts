import type { IJsonQueryWhereFilter } from '@lomray/microservice-helpers';
import { Api, Log } from '@lomray/microservice-helpers';
import type IUser from '@lomray/microservices-client-api/interfaces/users/entities/user';
import { JQOperator } from '@lomray/microservices-types/lib/src/query';
import { In, Repository } from 'typeorm';
import TaskMode from '@constants/task-mode';
import TaskType from '@constants/task-type';
import MessageEntity from '@entities/message';
import TaskEntity from '@entities/task';
import Factory from '@services/email-provider/factory';
import Abstract from './abstract';

class EmailAll extends Abstract {
  /**
   * @private
   */
  private messageRepository: Repository<MessageEntity>;

  /**
   * @private
   */
  private messageTemplate: Omit<MessageEntity, 'id'>;

  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(tasks, ({ type }: TaskEntity) => type === TaskType.EMAIL_ALL);
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

    if (
      !this.messageTemplate.text ||
      !this.messageTemplate.subject ||
      !this.messageTemplate.html ||
      !this.messageTemplate.html
    ) {
      throw new Error('Invalid message template.');
    }

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
    const sendService = await Factory.create(this.messageRepository);
    const initPage = Number(lastFailTargetId) || 1;
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Math.floor(offset / this.chunkSize) + initPage;

    do {
      // Apply where clause to users list query
      let where: IJsonQueryWhereFilter<IUser<string>> | null = null;

      /**
       * Find all sent emails and get all users with emails
       * @description If full check up mode all users will be re-checked
       */
      if (lastFailTargetId && mode !== TaskMode.FULL_CHECK_UP) {
        const sentEmails = await this.messageRepository
          .createQueryBuilder('message')
          .where('message.taskId = :taskId', { taskId: this.messageTemplate.taskId })
          .andWhere(
            "message.params ->> 'isTemplated' IS NOT NULL AND (message.params ->> 'isTemplated')::boolean = false",
          )
          .getMany();

        if (sentEmails.some(({ to }) => !to)) {
          throw new Error('Invalid sent emails recipient was found.');
        }

        where = sentEmails.length
          ? ({
              // Select users from chunk page only that did not receive emails
              email: {
                [JQOperator.notIn]: sentEmails.map(({ to }) => to) as string[],
              },
            } as IJsonQueryWhereFilter<IUser<string>>)
          : null;
      }

      const { result: usersListResult, error: usersListError } = await Api.get().users.user.list({
        query: {
          attributes: ['id', 'email', 'createdAt'],
          page: this.currentPage,
          pageSize: this.chunkSize,
          orderBy: { createdAt: 'ASC' },
          ...(where ? { where } : {}),
        },
      });

      if (usersListError) {
        Log.error(usersListError.message);

        throw new Error(usersListError.message);
      }

      if (usersListResult?.list.some(({ email }) => !email)) {
        // Throw internal error
        throw new Error('Some users have no email.');
      }

      // If all users were iterated - task done
      if (!usersListResult?.list.length) {
        return;
      }

      /**
       * Users that will be processed in current chunk
       */
      const processUsers: Pick<IUser, 'id' | 'email'>[] = [];

      if (mode === TaskMode.FULL_CHECK_UP) {
        /**
         * If full microservices will down - task SHOULD NOT be executed again
         * for the same users. So, we need to check if notices exist for these users.
         * In this case Last Error Target may not saved
         */
        const userIds = usersListResult.list.map(({ id }) => id);
        const existingEmails = await this.messageRepository.find({
          select: ['to', 'taskId'],
          where: { to: In(userIds), taskId: this.messageTemplate.taskId },
        });

        const notEmailedUserIds = userIds.filter(
          (userId) => !existingEmails.some(({ to }) => to === userId),
        );

        if (notEmailedUserIds.length === this.chunkSize) {
          continue;
        }

        const notNoticedUsers = notEmailedUserIds.map((id) => {
          const user = usersListResult.list.find(({ id: userId }) => userId === id);

          return { email: user?.email, id };
        });

        processUsers.push(...notNoticedUsers);
      } else {
        processUsers.push(...usersListResult.list.map(({ id, email }) => ({ id, email })));
      }

      // Send service will be automatically create not template messages
      const sendResults = await Promise.all(
        processUsers.map(({ email }) =>
          sendService.send({
            html: this.messageTemplate.html as string,
            taskId: this.messageTemplate.taskId as string,
            text: this.messageTemplate.text,
            subject: this.messageTemplate.subject,
            to: [email as string],
          }),
        ),
      );

      offset += sendResults.length;

      // Update pagination
      this.currentPage = Math.floor(offset / this.chunkSize) + initPage;
    } while (offset < usersCount);
  }
}

export default EmailAll;
