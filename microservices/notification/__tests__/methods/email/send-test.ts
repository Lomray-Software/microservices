import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { Repository } from 'typeorm';
import OriginalEndpointSend from '@methods/email/send';
import Factory from '@services/email-provider/factory';

const { default: Send } = rewiremock.proxy<{
  default: typeof OriginalEndpointSend;
}>(() => require('@methods/email/send'), {
  typeorm: TypeormMock.mock,
});

describe('methods/email/send', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Send({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly send email', async () => {
    let serviceParams: Parameters<typeof Factory.create> | undefined;
    let sendStub;

    sandbox.stub(RemoteConfig, 'get').resolves({ transportOptions: {} });

    const serviceStub = sandbox.stub(Factory, 'create').callsFake(async (...args) => {
      serviceStub.restore();

      const factory = await Factory.create(...args);

      serviceParams = args;
      sendStub = sandbox.stub(factory, 'send').resolves(true);

      return factory;
    });
    const methodParams = {
      to: ['demo@email.com'],
      subject: 'Test subject',
      text: 'Body message',
      html: '<strong>Body message</strong>',
    };

    const res = await Send(methodParams, endpointOptions);

    expect(res).to.deep.equal({ isSent: true });
    expect(serviceParams?.[0]).to.instanceof(Repository);
    expect(sendStub).to.calledOnceWith(methodParams);
  });
});
