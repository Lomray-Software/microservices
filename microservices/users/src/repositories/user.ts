import bcrypt from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import IdProvider from '@constants/id-provider';
import { MS_USER_PASSWORD_SALT_ROUNDS } from '@constants/index';
import Profile from '@entities/profile';
import UserEntity from '@entities/user';

@EntityRepository(UserEntity)
class User extends Repository<UserEntity> {
  /**
   * Encrypt user password
   */
  public encryptPassword(user: UserEntity): UserEntity {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, MS_USER_PASSWORD_SALT_ROUNDS);
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
  public async attachProfile(user: UserEntity): Promise<UserEntity> {
    user.profile = (await this.manager
      .getRepository(Profile)
      .findOne({ userId: user.id })) as Profile;

    return user;
  }
}

export default User;
