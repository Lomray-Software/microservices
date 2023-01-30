import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import UserRepository from '@repositories/user';
import SignIn from '@services/sign-in';

describe('services/sign-out', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const correctPassword = 'example';
  const mockUser = repository.create({
    id: 'user-id',
    password: correctPassword,
  });

  before(async () => {
    await repository.encryptPassword(mockUser);
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: user not found', async () => {
    const service = SignIn.init({ login: '', password: '', repository });

    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.auth())).to.throw();
  });

  it('should throw error: password not set for user', async () => {
    const service = SignIn.init({ login: '', password: '', repository });

    TypeormMock.entityManager.findOne.resolves({ ...mockUser, password: null });

    expect(await waitResult(service.auth())).to.throw();
  });

  it('should throw error: password incorrect', async () => {
    const service = SignIn.init({ login: 'test@email.com', password: 'incorrect', repository });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.auth())).to.throw();
  });

  it('should correctly sign in with email', async () => {
    const login = 'test@email.com';
    const service = SignIn.init({ login, password: correctPassword, repository });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await service.auth()).to.deep.equal(mockUser);
  });

  it('should correctly sign in with phone', async () => {
    const login = '+375291112233';
    const service = SignIn.init({ login, password: correctPassword, repository });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await service.auth()).to.deep.equal(mockUser);
  });
});
