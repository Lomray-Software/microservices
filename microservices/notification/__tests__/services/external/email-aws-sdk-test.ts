import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import Mail from 'nodemailer/lib/mailer';
import sinon from 'sinon';
import EmailAWSSdk from '@services/external/email-aws-sdk';

describe('services/external/email-aws-sdk', () => {
  const sandbox = sinon.createSandbox();
  const options = {
    region: 'eu-west-1',
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
  };

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create instance with options', async () => {
    EmailAWSSdk.reset();

    const { transporter, defaultEmailFrom } = await EmailAWSSdk.get({ options });

    // @ts-ignore
    const { ses } = transporter.options.SES;

    expect(await ses.config.region()).to.deep.equal(options.region);
    expect(await ses.config.credentials()).to.deep.equal({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    });
    expect(transporter).instanceof(Mail);
    expect(defaultEmailFrom).to.undefined;
  });

  it('should successful create instance with remote config', async () => {
    EmailAWSSdk.reset();

    const defaultFrom = 'default@from.com';

    sandbox
      .stub(RemoteConfig, 'get')
      .onCall(0)
      .resolves({ defaultEmailFrom: defaultFrom })
      .onCall(1)
      .resolves(options);

    const { transporter, defaultEmailFrom } = await EmailAWSSdk.get({ isFromConfigMs: true });

    // @ts-ignore
    const { ses } = transporter.options.SES;

    expect(await ses.config.region()).to.deep.equal(options.region);
    expect(await ses.config.credentials()).to.deep.equal({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    });
    expect(transporter).instanceof(Mail);
    expect(defaultEmailFrom).to.equal(defaultFrom);
  });
});
