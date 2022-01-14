import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import AuthProviders from '@constants/auth-providers';
import OriginalMethod from '@methods/token/identify';
import { IdentifyAuthToken, IdentityReturnType } from '@services/methods/identity-auth-token';

const { default: method } = rewiremock.proxy<{ default: typeof OriginalMethod }>(
  () => require('@methods/token/identify'),
  {
    typeorm: TypeormMock.mock,
  },
);

describe('methods/token/identify', () => {
  const sandbox = sinon.createSandbox();
  const value = { userId: 'test-id', isAuth: true, provider: AuthProviders.jwt };
  const identifyAuthTokenStub = sandbox
    .stub(IdentifyAuthToken.prototype, 'identify')
    .resolves(value);

  before(() => {
    sandbox.stub(RemoteConfig, 'get');
  });

  after(() => {
    sandbox.restore();
  });

  it('should throw validation input params', async () => {
    // @ts-ignore
    const result = method({}, endpointOptions);

    expect(await waitResult(result)).to.throw('invalid request params');
  });

  it('should correct identify token', async () => {
    const inputParams = {
      token: 'access-token',
      returnType: IdentityReturnType.directly,
    };

    const result = await method(inputParams, endpointOptions);

    const [thisValue] = identifyAuthTokenStub.thisValues;
    const params = identifyAuthTokenStub.firstCall.firstArg;

    expect(identifyAuthTokenStub).to.calledOnce;
    expect(thisValue.jwtConfig).to.have.property('secretKey');
    expect(thisValue.repository).to.instanceof(Repository);
    expect(params).to.deep.equal(inputParams);
    expect(result).to.deep.equal(value);
  });
});
