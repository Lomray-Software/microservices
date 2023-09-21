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

    const repository = this.manager.getRepository(NoticeEntity);
    const { affected } = await repository.update(
      {
        userId,
        isHidden: false,
      },
      {
        isHidden: true,
      },
    );

    return {
      status: true,
      affected,
    };
  }
}

export default Notice;
