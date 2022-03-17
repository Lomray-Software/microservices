import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import Mail from 'nodemailer/lib/mailer';
import sinon from 'sinon';
import EmailSimpleSdk from '@services/external/email-simple-sdk';

describe('services/external/email-simple-sdk', () => {
  const sandbox = sinon.createSandbox();
  const options = { host: 'smtp.example.com', port: 587 };

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create instance with json string options', async () => {
    EmailSimpleSdk.reset();

    const { transporter, defaultEmailFrom } = await EmailSimpleSdk.get({
      options: JSON.stringify(options),
    });

    expect(transporter.options).to.deep.equal(options);
    expect(transporter).instanceof(Mail);
    expect(defaultEmailFrom).to.undefined;
  });

  it('should successful create instance with remote config', async () => {
    EmailSimpleSdk.reset();

    const defaultFrom = 'default@from.com';

    sandbox
      .stub(RemoteConfig, 'get')
      .resolves({ transportOptions: options, defaultEmailFrom: defaultFrom });

    const { transporter, defaultEmailFrom } = await EmailSimpleSdk.get({ isFromConfigMs: 1 });

    expect(transporter.options).to.deep.equal(options);
    expect(transporter).instanceof(Mail);
    expect(defaultEmailFrom).to.equal(defaultFrom);
  });
});
