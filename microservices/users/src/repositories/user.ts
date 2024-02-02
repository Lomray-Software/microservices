import { Api, Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import bcrypt from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import remoteConfig from '@config/remote';
import ExceptionCode from '@constants/exception-code';
import IdProvider from '@constants/id-provider';
import Profile from '@entities/profile';
import UserEntity from '@entities/user';

@EntityRepository(UserEntity)
class User extends Repository<UserEntity> {
  /**
   * Encrypt user password
   */
  public async encryptPassword(user: UserEntity): Promise<UserEntity> {
    if (user.password) {
      const { passwordSaltRounds } = await remoteConfig();

      user.password = bcrypt.hashSync(user.password, passwordSaltRounds);
    }

    return user;
  }

  /**
   * Validate user password
   */
  public isValidPassword(user: UserEntity, password: string): boolean {
    if (!user.password) {
      return false;
    }

    return bcrypt.compareSync(password, user.password);
  }

  /**
   * Find user by provider identifier
   */
  public findUserByIdentifier(
    provider: IdProvider,
    identifier: string,
  ): Promise<UserEntity | undefined> {
    return this.createQueryBuilder('u')
      .withDeleted()
      .leftJoin('u.identityProviders', 'ip')
      .leftJoinAndSelect('u.profile', 'profile')
      .where('ip.provider = :provider AND identifier = :identifier', {
        provider,
        identifier,
      })
      .getOne();
  }

  /**
   * Add profile entity to user
   */
  public async attachProfile(
    user: UserEntity,
    updateParams?: Partial<Profile['params']>,
  ): Promise<UserEntity> {
    const repository = this.manager.getRepository(Profile);
    const profile = (await repository.findOne({ userId: user.id }))!;

    if (updateParams) {
      profile.params = { ...profile.params, ...updateParams };

      await repository.save(profile);
    }

    user.profile = profile;

    return user;
  }

  /**
   * Verify if restore account time is exceeded
   */
  public async verifyDeleteAt(user?: UserEntity): Promise<void> {
    const { removedAccountRestoreTime } = await remoteConfig();

    /**
     * If account wasn't removed
     */
    if (typeof user?.deletedAt?.toString() !== 'string') {
      return;
    }

    const restoreTimeAllowance = new Date(
      user.deletedAt?.getTime() + removedAccountRestoreTime * 60 * 60 * 1000,
    );

    if (new Date() < restoreTimeAllowance) {
      return;
    }

    throw new BaseException({
      code: ExceptionCode.ACCOUNT_REMOVED,
      message: 'Account was removed.',
      status: 403,
    });
  }

  /**
   * Clear  user tokens
   * @description If token passed - clear rest user tokens
   * If token not passed - clear all user tokens
   */
  public async clearUserTokens(userId: string, tokenId?: string): Promise<void> {
    const query = {
      where: {
        userId,
        ...(tokenId ? { id: tokenId } : {}),
      },
    };

    const { error: countError, result: countResult } = await Api.get().authentication.token.count({
      query,
    });

    if (countError || !countResult) {
      Log.error(countError?.message);

      throw new BaseException({
        status: 500,
        message: 'Failed to clear rest user tokens.',
      });
    }

    const { count: tokensCount } = countResult;

    if (!tokensCount) {
      return;
    }

    const { error } = await Api.get().authentication.token.remove({
      query,
      payload: {
        authorization: {
          filter: {
            methodOptions: {
              isAllowMultiple: true,
            },
          },
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

export default User;
