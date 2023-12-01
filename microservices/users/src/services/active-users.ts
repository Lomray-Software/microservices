import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { JQOperator } from '@lomray/microservices-types';
import { EntityManager, getManager } from 'typeorm';

export interface IActiveUsersParams {
  manager?: EntityManager;
  dayInterval?: number;
}

/**
 * Active users
 */
class ActiveUsers {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly dayInterval: number;

  /**
   * @constructor
   */
  private constructor({ dayInterval = 30, manager = getManager() }: IActiveUsersParams) {
    this.manager = manager;
    this.dayInterval = dayInterval;
  }

  /**
   * Init services
   */
  public static init(params: IActiveUsersParams): ActiveUsers {
    return new ActiveUsers(params);
  }

  /**
   * Returns active users count
   */
  public async compute(): Promise<number> {
    const { result, error } = await Api.get().authentication.token.count({
      query: {
        where: {
          createdAt: {
            [JQOperator.lessOrEqual]: new Date(
              Date.now() - this.dayInterval * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        },
        groupBy: ['userId'],
      },
    });

    if (error || !result) {
      Log.error(error?.message);

      throw new BaseException({
        status: 500,
        message: 'Failed to get active users count.',
      });
    }

    return result.count;
  }
}

export default ActiveUsers;
