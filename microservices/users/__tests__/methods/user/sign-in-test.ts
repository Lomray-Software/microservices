import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import User from '@entities/user';
import OriginalEndpointSignIn from '@methods/user/sign-in';
import SignInService, { ISignInParams } from '@services/sign-in';

const { default: SignIn } = rewiremock.proxy<{
  default: typeof OriginalEndpointSignIn;
}>(() => require('@methods/user/sign-in'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/sign-in', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = SignIn({}, endpointOptions);

    expect(await waitResult(res)).to.throw('invalid request params');
  });

  it('should correctly sign in', async () => {
    let serviceParams: ISignInParams | undefined;
    let authStub;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });

    const signInStub = sandbox.stub(SignInService, 'init').callsFake((params) => {
      signInStub.restore();

      const service = SignInService.init(params);

      serviceParams = params;
      authStub = sandbox.stub(service, 'auth').resolves(mockUser);

      return service;
    });
    const methodParams = { login: 'login-user', password: 'password-user' };

    const res = await SignIn(methodParams, endpointOptions);

    expect(res).to.deep.equal({ user: mockUser });
    expect(methodParams.login).to.equal(serviceParams?.login);
    expect(methodParams.password).to.equal(serviceParams?.password);
    expect(serviceParams?.repository).to.instanceof(Repository);
    expect(authStub).to.calledOnce;
  });
});
