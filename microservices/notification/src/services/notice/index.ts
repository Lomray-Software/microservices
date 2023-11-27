import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import _ from 'lodash';
import { EntityManager, getManager } from 'typeorm';
import NoticeEntity from '@entities/notice';
import type { HideAllOutput } from '@methods/notice/hide-all';

export interface ICreateBatchParams extends Pick<NoticeEntity, 'description' | 'title' | 'type'> {
  status: string;
  userIds?: string[];
  isForAll?: boolean;
}

interface INotice extends Omit<ICreateBatchParams, 'userIds' | 'isForAll'> {}

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
  private readonly chunkSize = 50;

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
   * Create batch notices
   */
  public createBatch({ userIds, isForAll, ...notice }: ICreateBatchParams): Promise<number> {
    if ((!isForAll && !userIds?.length) || (isForAll && userIds?.length)) {
      throw new BaseException({
        status: 400,
        message: 'Expected either users, either for all option to be provided.',
      });
    }

    /**
     * If one or the notice will fail - rollback all notices
     */
    return this.manager.transaction((entityManager) => {
      if (userIds?.length) {
        return this.sendUsersGroup(entityManager, userIds, notice);
      }

      return this.sendForAll(entityManager, notice);
    });
  }

  /**
   * Send notice for specific group of users
   */
  private async sendUsersGroup(
    entityManager: EntityManager,
    userIds: string[],
    { status, ...restNotice }: INotice,
  ): Promise<number> {
    const repository = entityManager.getRepository(NoticeEntity);
    const usersGroupChunks = _.chunk(userIds, this.chunkSize);
    let createdCount = 0;

    for (const usersChunk of usersGroupChunks) {
      const entities = usersChunk.map((userId) =>
        repository.create({
          ...restNotice,
          userId,
          params: {
            status,
          },
        }),
      );

      await repository.save(entities);

      createdCount += entities.length;
    }

    return createdCount;
  }

  /**
   * Send notice for all
   */
  private async sendForAll(
    entityManager: EntityManager,
    { status, ...restNotice }: INotice,
  ): Promise<number> {
    const { result: usersCountResult, error: usersCountError } = await Api.get().users.user.count();

    if (usersCountError) {
      throw new BaseException({
        status: 500,
        message: 'Failed to send group notice. Unable to retrieve users count.',
      });
    }

    const repository = entityManager.getRepository(NoticeEntity);
    let offset = 0;
    let createdCount = 0;

    do {
      const { result: usersListResult, error: usersListError } = await Api.get().users.user.list({
        query: {
          attributes: ['id'],
          page: Math.floor(offset / this.chunkSize) + 1,
          pageSize: this.chunkSize,
        },
      });

      if (usersListError) {
        Log.error(usersListError.message);

        throw new BaseException({
          status: 400,
          message: `Failed to retrieve user list for offset ${offset}.`,
        });
      }

      if (!usersListResult?.list) {
        return createdCount;
      }

      const entities = usersListResult.list.map(({ id: userId }) =>
        repository.create({
          ...restNotice,
          userId,
          params: {
            status,
          },
        }),
      );

      await repository.save(entities);

      createdCount += entities.length;

      offset += this.chunkSize;
    } while (offset < usersCountResult!.count);

    return createdCount;
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
