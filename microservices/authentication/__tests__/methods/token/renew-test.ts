import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import OriginalMethod from '@methods/token/renew';
import { TokenCreateReturnType } from '@services/methods/create-auth-token';
import { RenewAuthToken } from '@services/methods/renew-auth-token';

const { default: method } = rewiremock.proxy<{ default: typeof OriginalMethod }>(
  () => require('@methods/token/renew'),
  {
    typeorm: TypeormMock.mock,
  },
);

describe('methods/token/renew', () => {
  const sandbox = sinon.createSandbox();
  const value = { access: 'access-token', refresh: 'refresh-token' };
  const renewAuthTokenStub = sandbox.stub(RenewAuthToken.prototype, 'renew').resolves(value);

  before(() => {
    sandbox.stub(RemoteConfig, 'get');
  });

  after(() => {
    sandbox.restore();
  });

  it('should throw validation input params', async () => {
    // @ts-ignore
    const result = method({}, endpointOptions);

    expect(await waitResult(result)).to.throw('Invalid request params');
  });

  it('should correct renew tokens', async () => {
    const inputParams = {
      access: 'access-input',
      refresh: 'refresh-input',
      returnType: TokenCreateReturnType.directly,
    };

    const result = await method(inputParams, endpointOptions);

    const [thisValue] = renewAuthTokenStub.thisValues;
    const params = renewAuthTokenStub.firstCall.firstArg;

    expect(renewAuthTokenStub).to.calledOnce;
    expect(thisValue.jwtConfig).to.have.property('secretKey');
    expect(thisValue.repository).to.instanceof(Repository);
    expect(params).to.deep.equal(inputParams);
    expect(result).to.deep.equal(value);
  });
});
