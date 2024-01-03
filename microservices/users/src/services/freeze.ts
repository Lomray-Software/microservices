import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager } from 'typeorm';
import User from '@entities/user';

export interface IFreezeParams {
  userId: string;
  status: FreezeStatusType;
  manager: EntityManager;
}

// Used for preventing naming correlation
export enum FreezeStatusType {
  FREEZE = 'freeze',
  UN_FREEZE = 'unFreeze',
}

/**
 * Freeze service
 */
class Freeze {
  /**
   * @private
   */
  private readonly userId: string;

  /**
   * Freeze status
   */
  private readonly status: FreezeStatusType;

  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @constructor
   * @private
   */
  private constructor({ userId, status, manager }: IFreezeParams) {
    this.userId = userId;
    this.status = status;
    this.manager = manager;
  }

  /**
   * Init service
   */
  public static init(params: IFreezeParams): Freeze {
    return new Freeze(params);
  }

  /**
   * Process freeze status
   */
  public async process(): Promise<User> {
    const userRepository = this.manager.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: this.userId,
      },
    });

    if (!user) {
      throw new BaseException({
        status: 404,
        message: 'User was not found.',
      });
    }

    const isFrozen = this.status === FreezeStatusType.FREEZE;

    // If freeze status already performed to the user
    if (user.isFrozen === isFrozen) {
      return user;
    }

    // Update freeze status
    user.isFrozen = isFrozen;

    await userRepository.save(user);

    // If freeze status is frozen - clear all user tokens
    if (isFrozen) {
      await this.clearAllUserTokens();
    }

    return user;
  }

  /**
   * Clear all user tokens
   * @private
   */
  private async clearAllUserTokens(): Promise<void> {
    const { error } = await Api.get().authentication.token.remove({
      query: {
        where: {
          userId: this.userId,
        },
      },
    });

    if (!error) {
      return;
    }

    Log.error(error.message);

    throw new BaseException({
      status: 500,
      message: 'Failed to remove user tokens.',
    });
  }
}

export default Freeze;
