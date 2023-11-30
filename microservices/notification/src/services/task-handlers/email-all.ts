import { Api, Log } from '@lomray/microservice-helpers';
import type IUser from '@lomray/microservices-client-api/interfaces/users/entities/user';
import _ from 'lodash';
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
   * @private
   */
  private currentPage = 1;

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

    if (!this.checkIsMessageTemplateValid(this.messageTemplate)) {
      throw new Error('Invalid message template.');
    }

    await this.sendEmailToAllUsers(task);
  }

  /**
   * Send email to all users
   * @description Get all users count and execute task
   */
  private async sendEmailToAllUsers(task: TaskEntity): Promise<void> {
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
    const sendService = await Factory.create(this.messageRepository);
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Number(lastFailTargetId) || 1;

    do {
      const { result: usersListResult, error: usersListError } = await Api.get().users.user.list({
        query: {
          attributes: ['id', 'email', 'createdAt'],
          page: this.currentPage,
          pageSize: this.chunkSize,
          orderBy: { createdAt: 'ASC' },
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

      if (
        mode === TaskMode.FULL_CHECK_UP ||
        (lastFailTargetId && this.currentPage === Number(lastFailTargetId))
      ) {
        const emails = usersListResult.list.map(({ email }) => email);
        const sentEmails = await this.messageRepository.find({
          select: ['to', 'taskId'],
          where: { to: In(emails), taskId: this.messageTemplate.taskId },
        });
        const notEmailedUsersEmail = _.compact(
          emails.filter((email) => !sentEmails.some(({ to }) => to === email)),
        );

        // If emails exist for all current chunk users - continue to next chunk
        if (notEmailedUsersEmail.length === 0) {
          this.currentPage += 1;
          continue;
        }

        const notEmailedUsers = notEmailedUsersEmail.map((email) => {
          const user = usersListResult.list.find(({ email: userEmail }) => userEmail === email);

          return { email, id: user?.id as string };
        });

        processUsers.push(...notEmailedUsers);
      } else {
        processUsers.push(...usersListResult.list.map(({ id, email }) => ({ id, email })));
      }

      // Send service will be automatically create not template messages
      const savedEmails = await Promise.all(
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

      offset += savedEmails.length;

      // Update pagination
      this.currentPage += 1;
    } while (offset < usersCount);
  }
}

export default EmailAll;
