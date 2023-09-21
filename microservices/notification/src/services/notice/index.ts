import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager, getManager } from 'typeorm';
import NoticeEntity from '@entities/notice';

/**
 * Notice service
 */
class Notice {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private constructor() {
    this.manager = getManager();
  }

  /**
   * Init service
   */
  public static init(): Notice {
    return new Notice();
  }

  /**
   * Hide all user's notifications
   */
  public hideAll(userId?: string): Promise<number> {
    if (!userId) {
      throw new BaseException({ status: 500, message: 'No user provided' });
    }

    return this.manager.transaction(async (entityManager): Promise<number> => {
      const repository = entityManager.getRepository(NoticeEntity);
      const { affected } = await repository.update(
        {
          userId,
          isHidden: false,
        },
        {
          isHidden: true,
        },
      );

      return Number(affected);
    });
  }
}

export default Notice;
