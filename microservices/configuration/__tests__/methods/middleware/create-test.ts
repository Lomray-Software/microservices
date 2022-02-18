import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { MiddlewareType } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareServer } from '@lomray/microservice-remote-middleware';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalMiddlewareCreate from '@methods/middleware/create';

const { default: Create } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareCreate;
}>(() => require('@methods/middleware/create'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/create', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should correctly create entity', async () => {
    const fields = {
      sender: 'sender',
      senderMethod: 'senderMethod',
      target: 'target',
      targetMethod: 'targetMethod',
      type: MiddlewareType.request,
      params: {
        type: MiddlewareType.request,
      },
    };

    TypeormMock.entityManager.save.resolves([fields]);
    const remoteRegisterStub = sandbox.stub(RemoteMiddlewareServer.getInstance(), 'remoteRegister');

    const res = await Create({ fields }, endpointOptions);

    expect(res).to.deep.equal(fields);
    expect(remoteRegisterStub).to.calledOnce;
  });

  it('should throw error when we pass empty fields', async () => {
    const failedInput = Create({ fields: {} }, endpointOptions);
    // @ts-ignore
    const failedInput2 = Create({ fields: null }, endpointOptions);
    const failedInput3 = Create({ fields: {} }, endpointOptions);

    expect(await waitResult(failedInput)).to.throw();
    expect(await waitResult(failedInput2)).to.throw();
    expect(await waitResult(failedInput3)).to.throw();
  });
});
