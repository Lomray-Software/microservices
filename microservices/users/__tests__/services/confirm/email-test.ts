import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import ConfirmCode from '@entities/confirm-code';
import Email from '@services/confirm/email';

describe('services/confirm/email', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(ConfirmCode);
  const confirmCodeRepository = TypeormMock.entityManager.getRepository(ConfirmCode);
  const service = new Email(repository);
  const login = 'demo@email.com';
  const code = '123456';

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful send confirm code', async () => {
    sandbox.stub(Api.get().notification.email, 'send').resolves({});

    const isSuccess = await service.send(login);

    const [, { login: resLogin, code: resCode, expirationAt }] =
      TypeormMock.entityManager.upsert.firstCall.args;

    expect(isSuccess).to.true;
    expect(resLogin).to.equal(login);
    expect(resCode.length).to.equal(6);
    expect(String(expirationAt).length).to.equal(10); // default expiration is set
  });

  it('should return false if send email confirmation failed', async () => {
    sandbox.stub(Api.get().notification.email, 'send').resolves({
      error: { message: 'Failed send email message', code: 2, status: 2, service: 'tests' },
    });

    const isSuccess = await service.send(login);

    expect(isSuccess).to.false;
  });

  it('should verify code false: login or code empty', async () => {
    expect(await service.verifyCode(null, code)).to.false;
    expect(await service.verifyCode(undefined, code)).to.false;
    expect(await service.verifyCode('', code)).to.false;
    expect(await service.verifyCode('login')).to.false;
  });

  it('should verify code false: confirmation model does not exist', async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await service.verifyCode('demo@example.com', code)).to.false;
  });

  it('should verify code false: confirm code expired', async () => {
    TypeormMock.entityManager.findOne.resolves(
      confirmCodeRepository.create({
        login,
        code,
        expirationAt: Math.round(Date.now() / 1000) - 10,
      }),
    );

    expect(await service.verifyCode(login, code)).to.false;
  });

  it('should successful verify confirmation code', async () => {
    TypeormMock.entityManager.findOne.resolves(
      confirmCodeRepository.create({
        login,
        code,
        expirationAt: Math.round(Date.now() / 1000) + 60 * 60,
      }),
    );

    expect(await service.verifyCode(login, code)).to.true;
  });
});
