import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import IdentityProvider, { IdProvider } from '@entities/identity-provider';
import Profile from '@entities/profile';
import User from '@entities/user';
import UserRepository from '@repositories/user';

/**
 * Abstract class for identity providers
 */
abstract class Abstract {
  /**
   * @protected
   */
  protected readonly token: string;

  /**
   * @protected
   */
  protected readonly provider: IdProvider;

  /**
   * @protected
   */
  protected readonly userRepository: UserRepository;

  /**
   * @protected
   */
  protected readonly providerRepository: Repository<IdentityProvider>;

  /**
   * @protected
   */
  protected readonly profileRepository: Repository<Profile>;

  /**
   * @protected
   */
  protected readonly manager: EntityManager;

  /**
   * @constructor
   */
  public constructor(provider: IdProvider, token: string, manager: EntityManager) {
    this.provider = provider;
    this.token = token;
    this.userRepository = manager.getCustomRepository(UserRepository);
    this.providerRepository = manager.getRepository(IdentityProvider);
    this.profileRepository = manager.getRepository(Profile);
    this.manager = manager;
  }

  /**
   * Sign in user
   */
  public abstract signIn(params?: Record<string, any>): Promise<User>;

  /**
   * Attach new identity provider to existing user
   */
  public abstract attachProvider(userId: string, params?: Record<string, any>): Promise<User>;

  /**
   * Validate entities
   * @private
   */
  private async validateEntities(entitiesObj: (ObjectLiteral | undefined)[]): Promise<void> {
    const entities = entitiesObj.filter(Boolean) as ObjectLiteral[];
    const errors = (
      await Promise.all(
        entities.map((entity) => validate(entity, { whitelist: true, forbidNonWhitelisted: true })),
      )
    ).map((entityErrors) =>
      entityErrors.map(({ value, property, constraints }) => ({ value, property, constraints })),
    );

    if (errors.some((entityErrors) => entityErrors.length > 0)) {
      throw new BaseException({
        status: 422,
        message: 'Validation failed.',
        payload: errors,
      });
    }
  }

  /**
   * Create user and add related identity provider, update user profile
   * @protected
   */
  protected async createUser(
    entityUser: User,
    entityIdentityProvider: IdentityProvider,
    entityProfile?: Profile,
  ): Promise<User> {
    await this.validateEntities([entityUser, entityIdentityProvider, entityProfile]);

    return this.manager.transaction(async (transactionManager) => {
      const user = await transactionManager.getCustomRepository(UserRepository).save(entityUser);
      const profileRepository = transactionManager.getRepository(Profile);

      entityIdentityProvider.userId = user.id;

      let profile = (await profileRepository.findOne({ userId: user.id })) as Profile;

      if (entityProfile) {
        profile = profileRepository.merge(profile, entityProfile);
      }

      await Promise.all([
        transactionManager.getRepository(IdentityProvider).save(entityIdentityProvider),
        entityProfile ? profileRepository.save(profile) : Promise.resolve(null),
      ]);

      return user;
    });
  }

  /**
   * Add new identity provider to existing user and update: profile, user
   * @protected
   */
  protected async assign(
    entityIdentityProvider: IdentityProvider,
    user: User,
    profile?: Profile,
  ): Promise<User> {
    await this.validateEntities([entityIdentityProvider, user, profile]);

    return this.manager.transaction(async (transactionManager) => {
      entityIdentityProvider.userId = user.id;

      const [updatedUser] = await Promise.all([
        transactionManager.getCustomRepository(UserRepository).save(user),
        transactionManager.getRepository(IdentityProvider).save(entityIdentityProvider),
        profile ? transactionManager.getRepository(Profile).save(profile) : Promise.resolve(null),
      ]);

      return updatedUser;
    });
  }
}

export default Abstract;
