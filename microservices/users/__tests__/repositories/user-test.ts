import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import UserRepository from '@repositories/user';

describe('repositories/user', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const apiErrorMock = { status: 500, message: 'Mock error.', service: 'authentication', code: 1 };

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('clearUserTokens', () => {
    it('should stop clear all user tokens: tokens not found', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({ result: { count: 0 } });
      const clearTokensStub = sandbox.stub(Api.get().authentication.token, 'remove');

      await repository.clearUserTokens('user-id');

      expect(clearTokensStub).to.not.called;
    });

    it('should stop clear rest user tokens: tokens not found', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({ result: { count: 0 } });
      const clearTokensStub = sandbox.stub(Api.get().authentication.token, 'remove');

      await repository.clearUserTokens('user-id', 'token-id');

      expect(clearTokensStub).to.not.called;
    });

    it('should clear all user tokens', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({ result: { count: 2 } });
      const clearTokensStub = sandbox.stub(Api.get().authentication.token, 'remove').resolves({});

      await repository.clearUserTokens('user-id');

      expect(clearTokensStub).to.calledOnce;
    });

    it('should clear rest user tokens', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({ result: { count: 2 } });
      const clearTokensStub = sandbox.stub(Api.get().authentication.token, 'remove').resolves({});

      await repository.clearUserTokens('user-id', 'token-id');

      expect(clearTokensStub).to.calledOnce;
    });

    it('should stop clear all user tokens: token count error', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({
        error: apiErrorMock,
      });
      expect(await waitResult(repository.clearUserTokens('user-id'))).to.throw(
        'Failed to clear rest user tokens.',
      );
    });

    it('should stop clear rest user tokens: token count error', async () => {
      sandbox.stub(Api.get().authentication.token, 'count').resolves({
        error: apiErrorMock,
      });
      expect(await waitResult(repository.clearUserTokens('user-id', 'token-id'))).to.throw(
        'Failed to clear rest user tokens.',
      );
    });
  });
});
