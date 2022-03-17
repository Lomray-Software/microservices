import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import EmailProvider from '@constants/email-provider';
import Message from '@entities/message';
import Factory from '@services/email-provider/factory';
import Nodemailer from '@services/email-provider/nodemailer';
import EmailAwsSdk from '@services/external/email-aws-sdk';
import EmailSimpleSdk from '@services/external/email-simple-sdk';

describe('services/email-provider/factory', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(Message);

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create simple email provider', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ transportOptions: {} });

    const simpleSpy = sandbox.spy(EmailSimpleSdk, 'get');
    const service = await Factory.create(EmailProvider.SIMPLE, repository);

    expect(service).instanceof(Nodemailer);
    expect(simpleSpy).to.calledOnce;
  });

  it('should successful create AWS email provider', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ transportOptions: {}, region: 'eu-west-1' });

    const simpleSpy = sandbox.spy(EmailAwsSdk, 'get');
    const service = await Factory.create(EmailProvider.AWS_SES, repository);

    expect(service).instanceof(Nodemailer);
    expect(simpleSpy).to.calledOnce;
  });

  it('should throw error: unknown provider', async () => {
    const service = Factory.create('unknown', repository);

    expect(await waitResult(service)).to.throw('Unknown email provider');
  });
});
