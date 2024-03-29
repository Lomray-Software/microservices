import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { EntityManager } from 'typeorm';
import IdProvider from '@constants/id-provider';
import User from '@entities/user';
import { signIn as OriginalEndpointSignIn } from '@methods/identity-provider/sign-in';
import Factory from '@services/identity-provider/factory';

const { signIn: SignIn } = rewiremock.proxy<{
  signIn: typeof OriginalEndpointSignIn;
}>(() => require('@methods/identity-provider/sign-in'), {
  typeorm: TypeormMock.mock,
});

describe('methods/identity-provider/sign-in', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = SignIn({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly sign in through identity provider', async () => {
    let factoryParams: Parameters<typeof Factory.create> | undefined;
    let signInStub;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });
    const mockResult = { user: mockUser, isNew: false };
    const factoryStub = sandbox.stub(Factory, 'create').callsFake((...args) => {
      factoryStub.restore();

      const identityProviderService = Factory.create(...args);

      factoryParams = args;
      signInStub = sandbox.stub(identityProviderService, 'signIn').resolves(mockResult);

      return identityProviderService;
    });
    const someParams = { hello: 'world' };
    const methodParams = {
      provider: IdProvider.FIREBASE,
      token: 'token-id',
      params: someParams,
    };

    const res = await SignIn(methodParams, endpointOptions);

    expect(res).to.deep.equal(mockResult);
    expect(methodParams.provider).to.equal(factoryParams?.[0]);
    expect(methodParams.token).to.equal(factoryParams?.[1]);
    expect(factoryParams?.[2]).to.instanceof(EntityManager);
    expect(signInStub).to.calledOnceWith(someParams);
  });
});
