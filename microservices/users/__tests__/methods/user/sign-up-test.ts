import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { SinonStub } from 'sinon';
import { Repository } from 'typeorm';
import User from '@entities/user';
import OriginalEndpointSignUp from '@methods/user/sign-up';
import { Factory, ConfirmBy } from '@services/confirm/factory';
import SignUpService, { ISignUpParams } from '@services/sign-up';

const { default: SignUp } = rewiremock.proxy<{
  default: typeof OriginalEndpointSignUp;
}>(() => require('@methods/user/sign-up'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/sign-up', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = SignUp({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly sign up', async () => {
    let serviceParams: ISignUpParams | undefined;
    let confirmParams: Parameters<typeof Factory.create> | undefined;
    let registerStub: SinonStub | undefined;
    let verifyCodeStub: SinonStub | undefined;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });
    const confirmStub = sandbox.stub(Factory, 'create').callsFake((...args) => {
      confirmStub.restore();

      const confirmService = Factory.create(...args);

      confirmParams = args;
      verifyCodeStub = sandbox.stub(confirmService, 'verifyCode').resolves(true);

      return confirmService;
    });
    const signUpStub = sandbox.stub(SignUpService, 'init').callsFake((params) => {
      signUpStub.restore();

      const service = SignUpService.init(params);

      serviceParams = params;
      registerStub = sandbox.stub(service, 'register').resolves(mockUser);

      return service;
    });
    const methodParams = {
      fields: { firstName: 'Mike', email: 'test@email.com' },
      confirmBy: ConfirmBy.email,
      confirmCode: 123456,
    };

    const res = await SignUp(methodParams, endpointOptions);

    // sign up service
    expect(res).to.deep.equal({ user: mockUser });
    expect(methodParams.fields).to.deep.equal(serviceParams?.fields);
    expect(serviceParams?.repository).to.instanceof(Repository);
    expect(typeof serviceParams?.isConfirmed).to.equal('function');
    expect(registerStub).to.calledOnce;

    // for verifyCodeStub
    await serviceParams?.isConfirmed();

    // confirm service
    expect(methodParams.confirmBy).to.equal(confirmParams?.[0]);
    expect(confirmParams?.[1]).to.instanceof(Repository);
    expect(verifyCodeStub).to.calledOnceWith(methodParams.fields.email, methodParams.confirmCode);
  });
});
