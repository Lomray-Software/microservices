import { Microservice } from '@lomray/microservice-nodejs-lib';
import UsersEvents from '@lomray/microservices-client-api/constants/events/users';
import type { InsertEvent, UpdateEvent } from 'typeorm';
import { EntitySubscriberInterface, EventSubscriber, UpdateResult } from 'typeorm';
import IdentityProvider from '@entities/identity-provider';
import Profile from '@entities/profile';
import UserEntity from '@entities/user';

@EventSubscriber()
class User implements EntitySubscriberInterface<UserEntity> {
  /**
   * This subscriber only for User entity
   */
  public listenTo(): typeof UserEntity {
    return UserEntity;
  }

  /**
   * 1. Create profile when we create new user
   * 2. Generate username
   */
  public afterInsert({
    entity,
    manager,
  }: InsertEvent<UserEntity>): Promise<[UpdateResult, Profile]> {
    const profileRepository = manager.getRepository(Profile);
    const userRepository = manager.getRepository(UserEntity);

    if (!entity.username) {
      entity.username = entity.id.replace(/-/g, '');
    }

    void Microservice.eventPublish(UsersEvents.UserCreate, entity);

    return Promise.all([
      userRepository.update({ id: entity.id }, { username: entity.username }),
      profileRepository.save(profileRepository.create({ userId: entity.id })),
    ]);
  }

  /**
   * Also soft delete or restore user profile
   * @inheritDoc
   */
  public async afterUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    const profileRepository = event.manager.getRepository(Profile);
    const idProviderRepository = event.manager.getRepository(IdentityProvider);

    if (User.isRecovered(event)) {
      await Promise.all([
        profileRepository.restore({ userId: event.databaseEntity.id }),
        idProviderRepository.restore({ userId: event.databaseEntity.id }),
      ]);

      void Microservice.eventPublish(UsersEvents.UserRestore, { entity: event.entity });
    } else if (User.isSoftRemoved(event)) {
      await Promise.all([
        profileRepository.softDelete({ userId: event.databaseEntity.id }),
        idProviderRepository.softDelete({ userId: event.databaseEntity.id }),
      ]);

      void Microservice.eventPublish(UsersEvents.UserRemove, { entity: event.entity });
    } else {
      /**
       * If user data were updated
       */
      void Microservice.eventPublish(UsersEvents.UserUpdate, event.entity);
    }
  }

  /**
   * Detect if user is soft removed
   * @private
   */
  public static isSoftRemoved({ entity, databaseEntity }: UpdateEvent<UserEntity>): boolean {
    return typeof entity?.deletedAt?.toString() === 'string' && databaseEntity.deletedAt === null;
  }

  /**
   * Detect if user is restored
   * @private
   */
  public static isRecovered({ entity, databaseEntity }: UpdateEvent<UserEntity>): boolean {
    return entity?.deletedAt === null && typeof databaseEntity.deletedAt?.toString() === 'string';
  }
}

export default User;
