import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import S3AwsSdk from '@services/external/s3-aws-sdk';

describe('services/external/s3-aws-sdk', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully create instance with options', async () => {
    S3AwsSdk.reset();

    const options = {
      accessKeyId: 'access_key_id',
      secretAccessKey: 'secret_access_key',
      bucketName: 'bucket_name',
    };

    const { s3, bucketName } = await S3AwsSdk.get({ isFromConfigMs: 0, options });

    expect(s3.config.accessKeyId).to.equal(options.accessKeyId);
    expect(s3.config.secretAccessKey).to.equal(options.secretAccessKey);
    expect(bucketName).to.deep.equal(options.bucketName);
  });

  it('should successfully create instance with remote config', async () => {
    S3AwsSdk.reset();

    const fromRemoteConfig = {
      accessKeyId: 'remote_access_key_id',
      secretAccessKey: 'remote_secret_access_key',
      s3: {
        bucketName: 'remote_bucket_name',
      },
    };

    sandbox.stub(RemoteConfig, 'get').resolves(fromRemoteConfig);

    const { s3, bucketName } = await S3AwsSdk.get({ isFromConfigMs: 1 });

    expect(s3.config.accessKeyId).to.equal(fromRemoteConfig.accessKeyId);
    expect(s3.config.secretAccessKey).to.equal(fromRemoteConfig.secretAccessKey);
    expect(bucketName).to.equal(fromRemoteConfig.s3.bucketName);
  });
});
