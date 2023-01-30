import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import NodemailerLib from 'nodemailer';
import sinon from 'sinon';
import EmailProvider from '@constants/email-provider';
import Message from '@entities/message';
import Factory from '@services/email-provider/factory';
import Nodemailer from '@services/email-provider/nodemailer';

describe('services/email-provider/factory', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(Message);

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create simple email provider', async () => {
    const transportOptions = { simple: true };

    sandbox
      .stub(RemoteConfig, 'get')
      .resolves({ emailProvider: EmailProvider.SIMPLE, transportOptions });

    const simpleSpy = sandbox.spy(NodemailerLib, 'createTransport');
    const service = await Factory.create(repository);

    expect(service).instanceof(Nodemailer);
    expect(simpleSpy).to.calledOnceWith(transportOptions);
  });

  it('should successful create AWS email provider', async () => {
    const transportOptions = { awsOptions: true };

    sandbox.stub(RemoteConfig, 'get').resolves({ transportOptions });

    const simpleSpy = sandbox.spy(NodemailerLib, 'createTransport');
    const service = await Factory.create(repository);

    expect(service).instanceof(Nodemailer);
    expect(simpleSpy).to.calledOnceWith(transportOptions);
  });

  it('should throw error: unknown provider', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ emailProvider: 'unknown' });

    const service = Factory.create(repository);

    expect(await waitResult(service)).to.throw('Unknown email provider');
  });
});
