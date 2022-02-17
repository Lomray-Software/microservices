import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import OriginalEndpointSend from '@methods/confirm-code/send';
import { Factory, ConfirmBy } from '@services/confirm/factory';

const { default: Send } = rewiremock.proxy<{
  default: typeof OriginalEndpointSend;
}>(() => require('@methods/confirm-code/send'), {
  typeorm: TypeormMock.mock,
});

describe('methods/confirm-code/send', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Send({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly end confirmation code', async () => {
    let confirmParams: Parameters<typeof Factory.create> | undefined;
    let sendStub;

    const confirmStub = sandbox.stub(Factory, 'create').callsFake((...args) => {
      confirmStub.restore();

      const confirmService = Factory.create(...args);

      confirmParams = args;
      sendStub = sandbox.stub(confirmService, 'send').resolves(true);

      return confirmService;
    });
    const methodParams = {
      login: 'demo@email.com',
      type: ConfirmBy.email,
    };

    const res = await Send(methodParams, endpointOptions);

    expect(res).to.deep.equal({ isSent: true });
    expect(methodParams.type).to.equal(confirmParams?.[0]);
    expect(confirmParams?.[1]).to.instanceof(Repository);
    expect(sendStub).to.calledOnceWith(methodParams.login);
  });
});
