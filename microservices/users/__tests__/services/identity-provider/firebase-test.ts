import wait from '@lomray/client-helpers/helpers/wait';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import IdProvider from '@constants/id-provider';
import Profile from '@entities/profile';
import User from '@entities/user';
import OriginalFirebase from '@services/identity-provider/firebase';

const FirebaseSdkStub = sinon.stub();

const { default: Firebase } = rewiremock.proxy<{
  default: typeof OriginalFirebase;
}>(() => require('@services/identity-provider/firebase'), {
  '@services/external/firebase-sdk': FirebaseSdkStub,
});

describe('services/sign-up', () => {
  const sandbox = sinon.createSandbox();
  const email = 'some@email.com';
  const firebaseUid = 'firebase-uid';
  const providerGoogle = { uid: 'uid-google', providerId: 'google', photoURL: 'https://photo.url' };
  const providerFacebook = {
    uid: 'uid-facebook',
    providerId: 'facebook',
    photoURL: 'https://photo-facebook.url',
  };

  /**
   * Firebase mock
   * NOTE: user update user stub for handle approve provider flow
   */
  const firebaseMock = ({ user = {}, token = {}, updateUser = sinon.stub() } = {}) => ({
    auth: () => ({
      getUser: () => ({
        uid: firebaseUid,
        displayName: 'First Last Middle',
        photoUrl: 'http://example',
        providerData: [providerGoogle],
        ...user,
      }),
      verifyIdToken: () => ({
        sub: 'user_sub',
        // eslint-disable-next-line camelcase
        firebase: { sign_in_provider: providerGoogle.providerId },
        ...token,
      }),
      updateUser,
    }),
  });
  const mockUser = TypeormMock.entityManager
    .getRepository(User)
    .create({ id: 'user-id', firstName: 'Mike' });
  const mockProfile = () =>
    TypeormMock.entityManager.getRepository(Profile).create({ userId: mockUser.id, params: {} });

  mockUser.profile = mockProfile();

  const service = new Firebase(IdProvider.FIREBASE, 'firebase-token', TypeormMock.entityManager);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    FirebaseSdkStub.reset();
    sandbox.restore();
  });

  it('should throw error: firebase token invalid', async () => {
    FirebaseSdkStub.resolves({
      auth: () => ({ verifyIdToken: sandbox.stub().rejects() }),
    });

    expect(await waitResult(service.signIn())).to.throw('Bad firebase token');
  });

  it('should throw error: firebase user disabled', async () => {
    FirebaseSdkStub.resolves(firebaseMock({ user: { disabled: true } }));

    expect(await waitResult(service.signIn())).to.throw('Bad firebase token');
  });

  it('should successful sign in existing user', async () => {
    FirebaseSdkStub.resolves(firebaseMock());
    TypeormMock.queryBuilder.getOne.resolves(mockUser);

    const resp = await service.signIn();

    expect(resp).to.deep.equal({ user: mockUser, isNew: false });
  });

  it('should registration throw error: validation failed', async () => {
    FirebaseSdkStub.resolves(firebaseMock({ user: { email: 'invalid-email' } }));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    expect(await waitResult(service.signIn())).to.throw('Validation failed');
  });

  it('should registration throw error: disabled registration', async () => {
    FirebaseSdkStub.resolves(firebaseMock({ user: { email, emailVerified: true } }));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    expect(await waitResult(service.signIn({ isDenyRegister: true }))).to.throw('User not found.');
  });

  it('should registration throw error: user exist (split sign up/sign in)', async () => {
    FirebaseSdkStub.resolves(firebaseMock({ user: { email, emailVerified: true } }));
    TypeormMock.queryBuilder.getOne.resolves(mockUser);

    expect(await waitResult(service.signIn({ isDenyAuthViaRegister: true }))).to.throw(
      'User already exists.',
    );
  });

  it('should register new user without the photo', async () => {
    FirebaseSdkStub.resolves(
      firebaseMock({ user: { email: mockUser.email, emailVerified: true } }),
    );
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    TypeormMock.entityManager.findOne.resolves(mockProfile());
    TypeormMock.entityManager.save.resolves(mockUser);

    await service.signIn({ isShouldAttachUserPhoto: false });

    const [, profile] = TypeormMock.entityManager.save.thirdCall.args;

    expect(profile?.photo).to.be.null;
  });

  it('should register new user with the photo', async () => {
    FirebaseSdkStub.resolves(
      firebaseMock({ user: { email: mockUser.email, emailVerified: true } }),
    );
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    TypeormMock.entityManager.findOne.resolves(mockProfile());
    TypeormMock.entityManager.save.resolves(mockUser);

    await service.signIn();

    const [, profile] = TypeormMock.entityManager.save.thirdCall.args;

    expect(profile?.photo).to.be.equal(providerGoogle.photoURL);
  });

  it('should update user firebase account with non-trusted provider', async () => {
    const updateUserStub = sinon.stub();
    const firebaseUser = {
      user: {
        email,
        emailVerified: false,
        providerData: [providerFacebook],
      },
      // eslint-disable-next-line camelcase
      token: { firebase: { sign_in_provider: providerFacebook.providerId } },
      updateUser: updateUserStub,
    };

    /**
     * Create the firebaseMock object with the stubbed updateUser method
     */
    FirebaseSdkStub.resolves(firebaseMock(firebaseUser));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    await service.signIn({ isShouldApproveProvider: true });
    await wait(1);

    const [uid, { emailVerified }] = updateUserStub.firstCall.args;

    /**
     * Check that the updateUserStub was called with the correct parameters
     */
    expect(updateUserStub).to.calledOnce;
    expect(emailVerified).to.be.true;
    expect(uid).to.be.equal(firebaseUid);
  });

  it('should prevent update user firebase account with non-trusted provider', async () => {
    const updateUserStub = sinon.stub();
    const firebaseUser = {
      user: {
        email,
        emailVerified: false,
        providerData: [providerFacebook],
      },
      // eslint-disable-next-line camelcase
      token: { firebase: { sign_in_provider: providerFacebook.providerId } },
      updateUser: updateUserStub,
    };

    FirebaseSdkStub.resolves(firebaseMock(firebaseUser));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    await service.signIn();
    await wait(1);

    expect(updateUserStub).to.not.calledOnce;
  });

  it('should register new user', async () => {
    FirebaseSdkStub.resolves(firebaseMock({ user: { email, emailVerified: true } }));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    // mock transaction
    TypeormMock.entityManager.findOne.resolves(mockProfile());
    TypeormMock.entityManager.save.resolves(mockUser);

    const res = await service.signIn();

    // save user
    const [, entityUser] = TypeormMock.entityManager.save.firstCall.args;
    // save identity provider
    const [, identityProvider] = TypeormMock.entityManager.save.secondCall.args;
    // save profile
    const [, profile] = TypeormMock.entityManager.save.thirdCall.args;

    expect(res).to.deep.equal({ user: mockUser, isNew: true });
    expect(entityUser).to.deep.equal({
      firstName: 'First', // see firebase mock
      lastName: 'Last',
      middleName: 'Middle',
      email,
    });
    expect(identityProvider).to.deep.equal({
      provider: 'firebase',
      identifier: firebaseUid,
      type: providerGoogle.providerId,
      params: { uid: providerGoogle.uid },
      userId: mockUser.id,
    });
    expect(profile).to.deep.equal({
      userId: mockUser.id,
      photo: providerGoogle.photoURL,
      params: { isEmailVerified: true, isPhoneVerified: false },
    });
  });

  it('should attach provider throw error: user not found', async () => {
    FirebaseSdkStub.resolves(firebaseMock());
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.attachProvider('not-exist'))).to.throw('User not found');
  });

  it('should attach identity provider to exist user', async () => {
    const phone = '+12342355678';

    FirebaseSdkStub.resolves(
      firebaseMock({
        user: {
          phoneNumber: phone,
          providerData: [providerFacebook],
        },
        // eslint-disable-next-line camelcase
        token: { firebase: { sign_in_provider: providerFacebook.providerId } },
      }),
    );
    mockUser.profile = mockProfile();
    TypeormMock.entityManager.findOne.resolves(mockUser);
    TypeormMock.entityManager.save.resolves(mockUser);

    const res = await service.attachProvider(mockUser.id);

    // save user
    const [, entityUser] = TypeormMock.entityManager.save.firstCall.args;
    // save identity provider
    const [, identityProvider] = TypeormMock.entityManager.save.secondCall.args;
    // save profile
    const [, profile] = TypeormMock.entityManager.save.thirdCall.args;

    expect(res).to.equal(mockUser);
    expect(entityUser).to.deep.equal({ id: 'user-id', firstName: 'Mike', phone });
    expect(identityProvider).to.deep.equal({
      provider: 'firebase',
      identifier: firebaseUid,
      type: providerFacebook.providerId,
      params: { uid: providerFacebook.uid },
      userId: mockUser.id,
    });
    expect(profile).to.deep.equal({
      userId: mockUser.id,
      photo: `${providerFacebook.photoURL}?type=large`,
      params: { isEmailVerified: undefined, isPhoneVerified: true },
    });
  });
});
