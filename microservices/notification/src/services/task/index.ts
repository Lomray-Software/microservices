import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import { EntityManager } from 'typeorm';
import TaskType from '@constants/task-type';
import MessageEntity from '@entities/message';
import NoticeEntity from '@entities/notice';
import RecipientEntity from '@entities/recipient';
import TaskEntity from '@entities/task';

class Task {
  /**
   * Handles after insert
   */
  public static async handleAfterInsert(entity: TaskEntity, manager: EntityManager): Promise<void> {
    await this.handleAttach(entity, manager);
  }

  /**
   * Handle attach
   * @description Required attachment for task entity
   */
  private static async handleAttach(entity: TaskEntity, manager: EntityManager): Promise<void> {
    if (entity.type === TaskType.NOTICE_ALL) {
      await this.createAndAttachNoticeTemplate(entity, manager);

      return;
    }

    if (entity.type === TaskType.EMAIL_ALL) {
      await this.createAndAttachMessageTemplate(entity, manager);

      return;
    }

    if (entity.type !== TaskType.EMAIL_GROUP) {
      throw new BaseException({
        status: 400,
        message: 'Unexpected task type.',
      });
    }

    await Promise.all([
      this.createAndAttachRecipients(entity, manager),
      this.createAndAttachMessageTemplate(entity, manager),
    ]);
  }

  /**
   * Create and attach recipients
   */
  private static async createAndAttachRecipients(
    entity: TaskEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!entity?.recipients.length) {
      throw new BaseException({
        status: 400,
        message: 'Expected at least one recipient.',
      });
    }

    const recipientRepository = manager.getRepository(RecipientEntity);

    const recipients = entity.recipients.map((recipient) =>
      recipientRepository.create({
        ...recipient,
        taskId: entity.id,
      }),
    );

    const errors = await Promise.all(
      recipients.map((recipient) =>
        validate(recipient, {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        }),
      ),
    );

    if (errors.some((entityErrors) => entityErrors.length > 0)) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed for one or more recipients.',
        payload: errors,
      });
    }

    entity.recipients = await recipientRepository.save(recipients);
  }

  /**
   * Create and attach nested message template
   */
  private static async createAndAttachMessageTemplate(
    entity: TaskEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (
      !entity?.messages.length ||
      entity?.messages.length >= 2 ||
      !entity.messages[0].params.isTemplate
    ) {
      throw new BaseException({
        status: 400,
        message: 'Expected single message template.',
      });
    }

    const messageRepository = manager.getRepository(MessageEntity);
    const message = messageRepository.create({
      ...entity.messages?.[0],
      params: { ...entity.messages?.[0].params },
      taskId: entity.id,
    });

    const errors = await validate(message, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed for nested message entity.',
        payload: errors,
      });
    }

    entity.messages = await messageRepository.save([message]);
  }

  /**
   * Create and attach nested notice template
   */
  private static async createAndAttachNoticeTemplate(
    entity: TaskEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (
      !entity?.notices.length ||
      entity.notices.length >= 2 ||
      !entity.notices?.[0].params.isTemplate
    ) {
      throw new BaseException({
        status: 400,
        message: 'Expected single message template.',
      });
    }

    const noticeRepository = manager.getRepository(NoticeEntity);
    const notice = noticeRepository.create({
      ...entity.notices?.[0],
      params: { ...entity.notices?.[0].params },
      taskId: entity.id,
    });

    const errors = await validate(notice, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed for nested notice entity.',
        payload: errors,
      });
    }

    entity.notices = await noticeRepository.save([notice]);
  }
}

export default Task;
