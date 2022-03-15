import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import TokenType from '@constants/token-type';
import OriginalMethod from '@methods/token/create';
import { CreateAuthToken, TokenCreateReturnType } from '@services/methods/create-auth-token';

const { default: method } = rewiremock.proxy<{ default: typeof OriginalMethod }>(
  () => require('@methods/token/create'),
  {
    typeorm: TypeormMock.mock,
  },
);

describe('methods/token/create', () => {
  const sandbox = sinon.createSandbox();
  const value = { token: 'auth-token' };
  const createAuthTokenStub = sandbox.stub(CreateAuthToken.prototype, 'create').resolves(value);

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

  it('should correct create tokens', async () => {
    const inputParams = {
      userId: 'user-id-test',
      type: TokenType.personal,
      returnType: TokenCreateReturnType.directly,
    };

    const result = await method(inputParams, endpointOptions);

    const [thisValue] = createAuthTokenStub.thisValues;
    const params = createAuthTokenStub.firstCall.firstArg;

    expect(createAuthTokenStub).to.calledOnce;
    expect(thisValue.jwtConfig).to.have.property('secretKey');
    expect(thisValue.repository).to.instanceof(Repository);
    expect(params).to.deep.equal(inputParams);
    expect(result).to.deep.equal(value);
  });
});
