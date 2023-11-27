import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import { EntityManager } from 'typeorm';
import MessageEntity from '@entities/message';
import NoticeEntity from '@entities/notice';
import TaskEntity from '@entities/task';

class Task {
  /**
   * Handles after insert
   */
  public static async handleAfterInsert(entity: TaskEntity, manager: EntityManager): Promise<void> {
    await Promise.all([
      this.createAndAttachNoticeTemplate(entity, manager),
      this.createAndAttachMessageTemplate(entity, manager),
    ]);
  }

  /**
   * Create and attach nested message template
   */
  private static async createAndAttachMessageTemplate(
    entity: TaskEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!entity.message) {
      return;
    }

    const messageRepository = manager.getRepository(MessageEntity);
    const message = messageRepository.create({ ...entity.message, taskId: entity.id });

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

    entity.message = await messageRepository.save(message);
  }

  /**
   * Create and attach nested notice template
   */
  private static async createAndAttachNoticeTemplate(
    entity: TaskEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!entity.notice) {
      return;
    }

    const noticeRepository = manager.getRepository(NoticeEntity);
    const notice = noticeRepository.create({ ...entity.notice, taskId: entity.id });

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

    entity.notice = await noticeRepository.save(notice);
  }
}

export default Task;
