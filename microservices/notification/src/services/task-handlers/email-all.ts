import type { IJsonQueryWhereFilter } from '@lomray/microservice-helpers';
import { Api, Log } from '@lomray/microservice-helpers';
import type IUser from '@lomray/microservices-client-api/interfaces/users/entities/user';
import { JQOperator } from '@lomray/microservices-types/lib/src/query';
import { Repository } from 'typeorm';
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

    if (!this.messageTemplate.text || !this.messageTemplate.subject || !this.messageTemplate.html) {
      throw new Error('Invalid message template.');
    }

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
    const sendService = await Factory.create(this.messageRepository);
    const initPage = Number(lastFailTargetId) || 1;
    let offset = 0;

    // Start process from last error target id
    this.currentPage = Math.floor(offset / this.chunkSize) + initPage;

    do {
      // Apply where clause to users list query
      let where: IJsonQueryWhereFilter<IUser<string>> | null = null;

      // Find all sent emails and get all users with emails
      if (lastFailTargetId) {
        const sentEmails = await this.messageRepository.find({
          select: ['id', 'taskId', 'to'],
          where: {
            taskId: this.messageTemplate.taskId,
          },
        });

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

      // Send service will be automatically create not template messages
      const sendResults = await Promise.all(
        usersListResult.list.map(({ email }) =>
          sendService.send({
            html: this.messageTemplate.html as string,
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