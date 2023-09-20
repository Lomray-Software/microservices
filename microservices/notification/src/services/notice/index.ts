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
  public static init() {
    return new Notice();
  }

  /**
   * Hide all user's notifications
   */
  public hideAll(userId?: string) {
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
