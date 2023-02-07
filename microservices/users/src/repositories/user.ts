import bcrypt from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import remoteConfig from '@config/remote';
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
}

export default User;
