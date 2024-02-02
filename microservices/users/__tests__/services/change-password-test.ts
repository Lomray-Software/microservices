import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import * as remoteConfig from '@config/remote';
import User from '@entities/user';
import TClearUserTokens from '@interfaces/clear-user-tokens';
import UserRepository from '@repositories/user';
import ChangePassword from '@services/change-password';

describe('services/change-password', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  let clearUserTokensStub: sinon.SinonStub;
  const userId = 'user-id';
  const newPassword = 'new-password';
  const oldPassword = 'old-password';

  const mockUser = repository.create({
    id: userId,
    password: oldPassword,
  });

  before(async () => {
    await repository.encryptPassword(mockUser);
  });

  beforeEach(() => {
    clearUserTokensStub = sandbox.stub(repository, 'clearUserTokens');
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('change', () => {
    it('should throw error: user not found', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
      });

      TypeormMock.entityManager.findOne.resolves(undefined);

      expect(await waitResult(service.change(newPassword, oldPassword))).to.throw('User not found');
    });

    it('should throw error: oldPassword or confirmation not provided', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
      });

      expect(await waitResult(service.change(newPassword))).to.throw(
        'Either of confirm methods should be provided',
      );
    });

    it('should throw error: invalid old password', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
      });

      TypeormMock.entityManager.findOne.resolves(mockUser);

      expect(await waitResult(service.change(newPassword, 'invalid-password'))).to.throw(
        'Invalid old password',
      );
    });

    it('should throw error: invalid confirmation', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
        isConfirmed: () => false,
      });

      TypeormMock.entityManager.findOne.resolves(mockUser);

      expect(await waitResult(service.change(newPassword))).to.throw('Invalid confirmation code');
    });

    it('should successful change password', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
      });

      // Private method
      // @ts-ignore
      const handleClearUserTokensStub = sandbox.stub(service, 'handleClearUserTokens');

      TypeormMock.entityManager.findOne.resolves(mockUser);

      await service.change(newPassword, oldPassword);

      const [, user] = TypeormMock.entityManager.save.firstCall.args;
      const [argUserId] = handleClearUserTokensStub.firstCall.args;

      expect(repository.isValidPassword(user as User, newPassword)).to.true;
      expect(handleClearUserTokensStub).to.calledOnce;
      expect(argUserId).to.equal(userId);
    });
  });

  describe('handleClearUserTokens', () => {
    it('should stop validation: type is undefined or none', async () => {
      for (const type of [undefined, 'none']) {
        const service = ChangePassword.init({
          userId,
          repository,
          clearTokensType: type as TClearUserTokens,
        });

        await service['handleClearUserTokens'](userId);

        expect(clearUserTokensStub).to.not.called;
      }
    });

    it('should stop validation: type is undefined or none', async () => {
      for (const type of [undefined, 'none']) {
        const service = ChangePassword.init({
          userId,
          repository,
        });

        const remoteConfigStub = sinon.stub().resolves({
          changePasswordClearTokensType: type,
        });

        // @ts-ignore
        sinon.replace(remoteConfig, 'default', remoteConfigStub);

        await service['handleClearUserTokens'](userId);

        expect(clearUserTokensStub).to.not.called;

        sinon.restore();
      }
    });

    it('should call clear all user tokens: with user id', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
        clearTokensType: 'all',
      });

      await service['handleClearUserTokens'](userId);

      const [argUserId] = clearUserTokensStub.firstCall.args;

      expect(clearUserTokensStub).to.calledOnce;
      expect(argUserId).to.equal(userId);
    });

    it('should call clear rest user tokens: with user id', async () => {
      const token = 'token-id';

      const service = ChangePassword.init({
        userId,
        repository,
        clearTokensType: 'rest',
        currentToken: token,
      });

      await service['handleClearUserTokens'](userId);

      const [argUserId, argToken] = clearUserTokensStub.firstCall.args;

      expect(clearUserTokensStub).to.calledOnce;
      expect(argUserId).to.equal(userId);
      expect(argToken).to.equal(token);
    });

    it('should skip rest tokens clean up: current token not passed', async () => {
      const service = ChangePassword.init({
        userId,
        repository,
        clearTokensType: 'rest',
      });

      await service['handleClearUserTokens'](userId);

      expect(clearUserTokensStub).to.not.called;
    });
  });
});
