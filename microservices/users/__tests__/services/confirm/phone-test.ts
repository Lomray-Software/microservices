import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import ConfirmCode from '@entities/confirm-code';
import Phone from '@services/confirm/phone';

describe('services/confirm/phone', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(ConfirmCode);
  const service = new Phone(repository);
  const login = '+375291112233';

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful send confirm code', async () => {
    sandbox.stub(Api.get().notification.phone, 'send').resolves({});

    const isSuccess = await service.send(login);

    const [, { login: resLogin, code: resCode, expirationAt }] =
      TypeormMock.entityManager.upsert.firstCall.args;

    expect(isSuccess).to.true;
    expect(resLogin).to.equal(login);
    expect(resCode.length).to.equal(6);
    expect(String(expirationAt).length).to.equal(10); // default expiration is set
  });

  it('should return false if send phone confirmation failed', async () => {
    sandbox.stub(Api.get().notification.phone, 'send').resolves({
      error: { message: 'Failed send phone message', code: 1, status: 1, service: 'tests' },
    });

    const isSuccess = await service.send(login);

    expect(isSuccess).to.false;
  });
});
