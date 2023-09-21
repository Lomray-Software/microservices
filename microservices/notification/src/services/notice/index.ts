import { EntityManager, getManager } from 'typeorm';
import NoticeEntity from '@entities/notice';
import { HideAllOutput } from '@methods/notice/hide-all';

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
  public async hideAll(userId?: string): Promise<HideAllOutput> {
    if (!userId) {
      return {
        status: false,
      };
    }

    const affected = await this.manager.transaction(async (entityManager): Promise<number> => {
      const repository = entityManager.getRepository(NoticeEntity);
      const result = await repository.update(
        {
          userId,
          isHidden: false,
        },
        {
          isHidden: true,
        },
      );

      return Number(result.affected);
    });

    return {
      status: true,
      affected,
    };
  }
}

export default Notice;
