import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import UserRepository from '@repositories/user';
import Freeze, { FreezeStatusType } from '@services/freeze';

describe('services/freeze', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const correctPassword = 'example';
  const mockFrozenUser = repository.create({
    id: 'user-id',
    password: correctPassword,
    isFrozen: true,
  });
  const mockUnFrozenUser = repository.create({
    id: 'user-id',
    password: correctPassword,
  });

  const freezeUserService = Freeze.init({
    manager: TypeormMock.entityManager,
    userId: mockFrozenUser.id,
    status: FreezeStatusType.FREEZE,
  });
  const unFreezeUserService = Freeze.init({
    manager: TypeormMock.entityManager,
    userId: mockFrozenUser.id,
    status: FreezeStatusType.UN_FREEZE,
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly init freeze service', () => {
    expect(freezeUserService).to.instanceof(Freeze);
  });

  it('should throw error: user account was not found', async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(freezeUserService.process())).to.throw('User was not found.');
  });

  it('should freeze frozen user', async () => {
    TypeormMock.entityManager.findOne.resolves(mockFrozenUser);

    await freezeUserService.process();

    expect(TypeormMock.entityManager.save).to.not.called;
  });

  it('should unfreeze frozen user', async () => {
    // @ts-ignore
    const clearAllUserTokensStub = sandbox.stub(unFreezeUserService, 'clearAllUserTokens');

    TypeormMock.entityManager.findOne.resolves(mockFrozenUser);

    await unFreezeUserService.process();

    expect(TypeormMock.entityManager.save).to.calledOnce;
    expect(clearAllUserTokensStub).to.not.called;
  });

  it('should freeze user', async () => {
    // @ts-ignore
    const clearAllUserTokensStub = sandbox.stub(freezeUserService, 'clearAllUserTokens');

    TypeormMock.entityManager.findOne.resolves(mockUnFrozenUser);

    await freezeUserService.process();

    expect(TypeormMock.entityManager.save).to.calledOnce;
    expect(clearAllUserTokensStub).to.calledOnce;
  });
});
