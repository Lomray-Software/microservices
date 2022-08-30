import { FirebaseSdk } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import IdProvider from '@constants/id-provider';
import Profile from '@entities/profile';
import User from '@entities/user';
import type { TFirebaseAdmin } from '@services/external/firebase-sdk';
import Firebase from '@services/identity-provider/firebase';

describe('services/sign-up', () => {
  const sandbox = sinon.createSandbox();
  const firebaseUid = 'firebase-uid';
  const providerGoogle = { uid: 'uid-google', providerId: 'google', photoURL: 'https://photo.url' };
  const providerFacebook = {
    uid: 'uid-facebook',
    providerId: 'facebook',
    photoURL: 'https://photo-facebook.url',
  };
  const firebaseMock = ({ user = {}, token = {} } = {}) => ({
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
    }),
  });
  const mockUser = TypeormMock.entityManager
    .getRepository(User)
    .create({ id: 'user-id', firstName: 'Mike' });
  const mockProfile = () =>
    TypeormMock.entityManager.getRepository(Profile).create({ userId: mockUser.id, params: {} });

  mockUser.profile = mockProfile();

  const getFirebaseMock = (mock: Partial<TFirebaseAdmin> | Record<string, any>): TFirebaseAdmin =>
    mock as unknown as TFirebaseAdmin;
  const service = new Firebase(IdProvider.FIREBASE, 'firebase-token', TypeormMock.entityManager);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: firebase token invalid', async () => {
    sandbox.stub(FirebaseSdk, 'get').resolves(
      getFirebaseMock({
        auth: () => ({ verifyIdToken: sandbox.stub().rejects() }),
      }),
    );

    expect(await waitResult(service.signIn())).to.throw('Bad firebase token');
  });

  it('should throw error: firebase user disabled', async () => {
    sandbox
      .stub(FirebaseSdk, 'get')
      .resolves(getFirebaseMock(firebaseMock({ user: { disabled: true } })));

    expect(await waitResult(service.signIn())).to.throw('Bad firebase token');
  });

  it('should successful sign in existing user', async () => {
    sandbox.stub(FirebaseSdk, 'get').resolves(getFirebaseMock(firebaseMock()));
    TypeormMock.queryBuilder.getOne.resolves(mockUser);

    const user = await service.signIn();

    expect(user).to.equal(mockUser);
  });

  it('should registration throw error: validation failed', async () => {
    sandbox
      .stub(FirebaseSdk, 'get')
      .resolves(getFirebaseMock(firebaseMock({ user: { email: 'invalid-email' } })));
    TypeormMock.queryBuilder.getOne.resolves(undefined);

    expect(await waitResult(service.signIn())).to.throw('Validation failed');
  });

  it('should register new user', async () => {
    const email = 'demo@email.com';

    sandbox
      .stub(FirebaseSdk, 'get')
      .resolves(getFirebaseMock(firebaseMock({ user: { email, emailVerified: true } })));
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

    expect(res).to.equal(mockUser);
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
    sandbox.stub(FirebaseSdk, 'get').resolves(getFirebaseMock(firebaseMock()));
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.attachProvider('not-exist'))).to.throw('User not found');
  });

  it('should attach identity provider to exist user', async () => {
    const phone = '+375291112233';

    sandbox.stub(FirebaseSdk, 'get').resolves(
      getFirebaseMock(
        firebaseMock({
          user: {
            phoneNumber: phone,
            providerData: [providerFacebook],
          },
          // eslint-disable-next-line camelcase
          token: { firebase: { sign_in_provider: providerFacebook.providerId } },
        }),
      ),
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
    expect(entityUser).to.deep.equal({ id: 'user-id', firstName: 'Mike', phone: '+375291112233' });
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
