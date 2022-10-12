import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonStub } from 'sinon';
import { Repository } from 'typeorm';
import User from '@entities/user';
import { changeLogin as OriginalEndpointChangeLogin } from '@methods/user/change-login';
import ChangeLoginService, { IChangeLoginParams } from '@services/change-login';
import { Factory, ConfirmBy } from '@services/confirm/factory';

const { changeLogin: ChangeLogin } = rewiremock.proxy<{
  changeLogin: typeof OriginalEndpointChangeLogin;
}>(() => require('@methods/user/change-login'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/change-login', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = ChangeLogin({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly sign up', async () => {
    let serviceParams: IChangeLoginParams | undefined;
    let confirmParams: Parameters<typeof Factory.create> | undefined;
    let changeStub: SinonStub | undefined;
    let verifyCodeStub: SinonStub | undefined;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });
    const confirmStub = sandbox.stub(Factory, 'create').callsFake((...args) => {
      confirmStub.restore();

      const confirmService = Factory.create(...args);

      confirmParams = args;
      verifyCodeStub = sandbox.stub(confirmService, 'verifyCode').resolves(true);

      return confirmService;
    });
    const signUpStub = sandbox.stub(ChangeLoginService, 'init').callsFake((params) => {
      signUpStub.restore();

      const service = ChangeLoginService.init(params);

      serviceParams = params;
      changeStub = sandbox.stub(service, 'change').resolves(mockUser);

      return service;
    });
    const methodParams = {
      userId: 'user-id',
      login: 'test@email.com',
      confirmBy: ConfirmBy.email,
      confirmCode: 123456,
    };

    const res = await ChangeLogin(methodParams, endpointOptions);

    // sign up service
    expect(res).to.deep.equal({ isChanged: true });
    expect(methodParams.userId).to.deep.equal(serviceParams?.userId);
    expect(methodParams.login).to.deep.equal(serviceParams?.login);
    expect(serviceParams?.repository).to.instanceof(Repository);
    expect(typeof serviceParams?.isConfirmed).to.equal('function');
    expect(changeStub).to.calledOnce;

    // for verifyCodeStub
    await serviceParams?.isConfirmed();

    // confirm service
    expect(methodParams.confirmBy).to.equal(confirmParams?.[0]);
    expect(confirmParams?.[1]).to.instanceof(Repository);
    expect(verifyCodeStub).to.calledOnceWith(methodParams.login, methodParams.confirmCode);
  });
});
