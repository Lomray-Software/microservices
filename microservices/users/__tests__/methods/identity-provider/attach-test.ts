import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { EntityManager } from 'typeorm';
import IdProvider from '@constants/id-provider';
import User from '@entities/user';
import OriginalEndpointAttach from '@methods/identity-provider/attach';
import Factory from '@services/identity-provider/factory';

const { default: Attach } = rewiremock.proxy<{
  default: typeof OriginalEndpointAttach;
}>(() => require('@methods/identity-provider/attach'), {
  typeorm: TypeormMock.mock,
});

describe('methods/identity-provider/attach', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Attach({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly attach identity provider to user', async () => {
    let factoryParams: Parameters<typeof Factory.create> | undefined;
    let signInStub;

    const mockUser = TypeormMock.entityManager.getRepository(User).create({ id: 'test-id' });
    const factoryStub = sandbox.stub(Factory, 'create').callsFake((...args) => {
      factoryStub.restore();

      const identityProviderService = Factory.create(...args);

      factoryParams = args;
      signInStub = sandbox.stub(identityProviderService, 'attachProvider').resolves(mockUser);

      return identityProviderService;
    });
    const someParams = { hello: 'world' };
    const methodParams = {
      userId: mockUser.id,
      provider: IdProvider.FIREBASE,
      token: 'token-id',
      params: someParams,
    };

    const res = await Attach(methodParams, endpointOptions);

    expect(res).to.deep.equal({ user: mockUser });
    expect(methodParams.provider).to.equal(factoryParams?.[0]);
    expect(methodParams.token).to.equal(factoryParams?.[1]);
    expect(factoryParams?.[2]).to.instanceof(EntityManager);
    expect(signInStub).to.calledOnceWith(methodParams.userId, someParams);
  });
});
