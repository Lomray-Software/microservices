import { BaseException } from '@lomray/microservice-nodejs-lib';
import { validate } from 'class-validator';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import IdProvider from '@constants/id-provider';
import IdentityProvider from '@entities/identity-provider';
import Profile from '@entities/profile';
import User from '@entities/user';
import UserRepository from '@repositories/user';

export interface ISingInReturn {
  user: User;
  isNew: boolean;
}

/**
 * isDenyRegister - prevent sign in if user exist
 * isDenyAuthViaRegister - prevent sign in if user exist (split sign up/sign in)
 */
export type TSingInParams = {
  isDenyRegister?: boolean;
  isDenyAuthViaRegister?: boolean;
  isShouldAttachUserPhoto?: boolean;
  isShouldApproveProvider?: boolean;
} & Record<string, any>;

/**
 * Abstract class for identity providers
 */
abstract class Abstract {
  /**
   * Is should attach user photo
   */
  protected isShouldAttachUserPhoto = true;

  /**
   * Is approve provider (prevent overriding for account)
   */
  protected isShouldApproveProvider = false;

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
  public abstract signIn(params?: TSingInParams): Promise<ISingInReturn>;

  /**
   * Attach new identity provider to existing user
   */
  public abstract attachProvider(userId: string, params?: Record<string, any>): Promise<User>;

  /**
   * Returns user from db by identity token
   */
  public abstract getUserByToken(): Promise<User | undefined>;

  /**
   * Validate entities
   * @private
   */
  protected async validateEntities(entitiesObj: (ObjectLiteral | undefined)[]): Promise<void> {
    const entities = entitiesObj.filter(Boolean) as ObjectLiteral[];
    const errors = await Promise.all(
      entities.map((entity) =>
        validate(entity, {
          whitelist: true,
          forbidNonWhitelisted: true,
          groups: ['create', 'sign-in-social', entity?.constructor?.name],
          always: true,
          validationError: { target: false },
        }),
      ),
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

      // add profile to response
      user.profile = profile;

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
