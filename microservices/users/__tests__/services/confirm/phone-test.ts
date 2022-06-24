import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { BaseException, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import ConfirmCode from '@entities/confirm-code';
import Phone from '@services/confirm/phone';
import Api from '@services/external/api';

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
    sandbox.stub(Api.notification.phone, 'send').resolves(new MicroserviceResponse());

    const isSuccess = await service.send(login);

    const [, { login: resLogin, code: resCode, expirationAt }] =
      TypeormMock.entityManager.upsert.firstCall.args;

    expect(isSuccess).to.true;
    expect(resLogin).to.equal(login);
    expect(resCode.length).to.equal(6);
    expect(String(expirationAt).length).to.equal(10); // default expiration is set
  });

  it('should return false if send phone confirmation failed', async () => {
    sandbox.stub(Api.notification.phone, 'send').resolves(
      new MicroserviceResponse({
        error: new BaseException({ message: 'Failed send phone message' }),
      }),
    );

    const isSuccess = await service.send(login);

    expect(isSuccess).to.false;
  });
});
