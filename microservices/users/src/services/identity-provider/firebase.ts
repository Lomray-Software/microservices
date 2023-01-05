import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import type { auth } from 'firebase-admin';
import IdentityProvider from '@entities/identity-provider';
import Profile from '@entities/profile';
import User from '@entities/user';
import FirebaseSdk from '@services/external/firebase-sdk';
import Abstract from '@services/identity-provider/abstract';
import type { ISingInReturn, TSingInParams } from '@services/identity-provider/abstract';

type UserRecord = auth.UserRecord;

/**
 * Firebase identity provider
 */
class Firebase extends Abstract {
  /**
   * @inheritDoc
   */
  public async signIn({ isDenyRegister }: TSingInParams = {}): Promise<ISingInReturn> {
    const [firebaseUser, providerType] = await this.getFirebaseUser();
    let user = await this.userRepository.findUserByIdentifier(this.provider, firebaseUser.uid);
    let isNew = false;

    if (!user) {
      if (isDenyRegister) {
        throw new BaseException({
          status: 500,
          message: 'User not found.',
        });
      }

      user = await this.register(firebaseUser, providerType);
      isNew = true;
    }

    return { user, isNew };
  }

  /**
   * @inheritDoc
   */
  public async attachProvider(userId: string): Promise<User> {
    const [firebaseUser, providerType] = await this.getFirebaseUser();
    const user = await this.userRepository.findOne({ id: userId }, { relations: ['profile'] });

    if (!user) {
      throw new BaseException({
        status: 404,
        message: 'User not found.',
      });
    }

    const { profile, email, phone } = user;

    // @ts-ignore this need for success pass validation
    delete user.profile;

    if (!email && firebaseUser.email) {
      user.email = firebaseUser.email;
    }

    if (!phone && firebaseUser.phoneNumber) {
      user.phone = firebaseUser.phoneNumber;
    }

    const identityProvider = this.getIdentityProvider(firebaseUser, providerType);

    return this.assign(identityProvider, user, this.getProfile(firebaseUser, profile));
  }

  /**
   * Sign up user
   * @protected
   */
  protected register(firebaseUser: UserRecord, type: string): Promise<User> {
    const [firstName, lastName, middleName] = firebaseUser.displayName?.split(' ') ?? [];
    const user = this.userRepository.create({
      firstName,
      lastName,
      middleName,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
    });
    const profile = this.getProfile(firebaseUser);
    const identityProvider = this.getIdentityProvider(firebaseUser, type);

    return this.createUser(user, identityProvider, profile);
  }

  /**
   * Make or update user profile
   * @protected
   */
  protected getProfile(firebaseUser: UserRecord, profile?: Profile): Profile {
    const updatedProfile = profile ?? this.profileRepository.create({ params: {} });

    if (!updatedProfile.photo) {
      updatedProfile.photo = Firebase.getUserPhoto(firebaseUser) ?? null;
    }

    updatedProfile.params.isEmailVerified = firebaseUser.emailVerified;
    updatedProfile.params.isPhoneVerified = Boolean(firebaseUser.phoneNumber);

    return updatedProfile;
  }

  /**
   * Get current identity provider
   * @protected
   */
  protected getIdentityProvider(firebaseUser: UserRecord, type: string): IdentityProvider {
    return this.providerRepository.create({
      provider: this.provider,
      identifier: firebaseUser.uid,
      type,
      params: {
        uid: Firebase.getTypeUid(firebaseUser, type),
      },
    });
  }

  /**
   * Get provider uid for facebook, google, etc...
   * @protected
   */
  protected static getTypeUid(firebaseUser: UserRecord, type: string): string | undefined {
    for (const { providerId, uid } of firebaseUser.providerData) {
      if (providerId === type) {
        return uid;
      }
    }

    return undefined;
  }

  /**
   * Get firebase user photo with large size
   * @protected
   */
  protected static getUserPhoto(firebaseUser: UserRecord): string | undefined {
    for (const { providerId, photoURL } of firebaseUser.providerData) {
      if (providerId.includes('google')) {
        return photoURL?.replace('s96-c', 's400-c');
      } else if (providerId.includes('facebook')) {
        return `${photoURL}?type=large`;
      }
    }

    return firebaseUser.photoURL;
  }

  /**
   * Get firebase user by token
   * @protected
   */
  protected async getFirebaseUser(): Promise<[UserRecord, string]> {
    const firebase = await FirebaseSdk();

    try {
      const validToken = await firebase.auth().verifyIdToken(this.token);
      const identifier = validToken.sub;
      const firebaseUser = await firebase.auth().getUser(identifier);

      if (firebaseUser.disabled) {
        throw new Error('User disabled.');
      }

      return [firebaseUser, validToken.firebase.sign_in_provider];
    } catch (e) {
      Log.error('Failed verify firebase token', e);

      throw new BaseException({
        status: 422,
        message: 'Bad firebase token.',
      });
    }
  }
}

export default Firebase;
