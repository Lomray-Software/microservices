import { Api, Batch, Log } from '@lomray/microservice-helpers';
import { Repository } from 'typeorm';
import TaskType from '@constants/task-type';
import MessageEntity from '@entities/message';
import RecipientEntity from '@entities/recipient';
import TaskEntity from '@entities/task';
import type AbstractEmailProvider from '@services/email-provider/abstract';
import Factory from '@services/email-provider/factory';
import Abstract from './abstract';

class EmailGroup extends Abstract {
  /**
   * @private
   */
  private messageRepository: Repository<MessageEntity>;

  /**
   * @private
   */
  private recipientRepository: Repository<RecipientEntity>;

  /**
   * @private
   */
  private messageTemplate: Omit<MessageEntity, 'id'>;

  /**
   * Take related tasks
   */
  public take(tasks: TaskEntity[]): boolean {
    return super.take(tasks, ({ type }: TaskEntity) => type === TaskType.EMAIL_GROUP);
  }

  /**
   * Process email group of recipients (users)
   */
  protected async processTasks(task: TaskEntity): Promise<void> {
    this.messageRepository = this.manager.getRepository(MessageEntity);
    this.recipientRepository = this.manager.getRepository(RecipientEntity);

    const messageTemplate = task.messages?.find(({ params }) => params.isTemplate);

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

    await this.sendEmailToRecipients();
  }

  /**
   * Send email to recipient (user) group
   * @description Get all users count and execute task
   */
  private async sendEmailToRecipients(): Promise<void> {
    const sendService = await Factory.create(this.messageRepository);

    await Batch.find(
      this.recipientRepository
        .createQueryBuilder('recipient')
        .leftJoin('recipient.message', 'message')
        // Send email for recipients that did not receive emails yet
        .where('recipient.taskId = :taskId AND message.id IS NULL', {
          taskId: this.messageTemplate.taskId,
        }),
      (recipients) => this.executeTask(sendService, recipients),
      { chunkSize: 50 },
    );
  }

  /**
   * Execute task
   */
  protected async executeTask(
    sendService: AbstractEmailProvider,
    recipients: RecipientEntity[],
  ): Promise<void> {
    if (!recipients.length) {
      return;
    }

    const { result: usersListResult, error: usersListError } = await Api.get().users.user.list({
      query: {
        attributes: ['id', 'email', 'createdAt'],
        where: {
          id: {
            in: recipients.map(({ userId }) => userId),
          },
        },
      },
    });

    if (usersListError || !usersListResult) {
      Log.error(usersListError?.message);

      throw new Error(usersListError?.message);
    }

    const { list: users } = usersListResult;

    if (users.some(({ email }) => !email)) {
      // Throw internal error
      throw new Error('Some users have no email.');
    }

    await Promise.all(
      users.map(({ email, id }) =>
        sendService.send({
          html: this.messageTemplate.html as string,
          taskId: this.messageTemplate.taskId as string,
          text: this.messageTemplate.text,
          subject: this.messageTemplate.subject,
          recipient: recipients.find(({ userId }) => userId === id),
          to: [email as string],
        }),
      ),
    );
  }
}

export default EmailGroup;
