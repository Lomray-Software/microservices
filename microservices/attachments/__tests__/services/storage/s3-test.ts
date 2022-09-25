import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import S3AwsSdk from '@services/external/s3-aws-sdk';
import S3Storage from '@services/storage/s3';

describe('services/attachment/image', () => {
  const options = {
    isFromConfigMs: 1,
    options: {
      accessKeyId: 'access_key_id',
      secretAccessKey: 'secret_access_key',
      region: 'region',
      bucketName: bucketNameMock,
    },
  };

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully upload file', async () => {
    S3AwsSdk.reset();

    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const { s3, bucketName } = await S3AwsSdk.get(options);

    sinon.stub(s3, 'upload').returns({ promise: sinon.stub() });

    const service = new S3Storage({ s3, bucketName });
    const params = {
      Key: 'key',
      Body: new Buffer('file'),
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    };

    await service.upload(params.Key, params.Body, 'image/jpeg');

    expect(s3.upload).to.be.calledWith({ Bucket: bucketNameMock, ...params });
  });

  it('should successfully delete files', async () => {
    S3AwsSdk.reset();

    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const { s3, bucketName } = await S3AwsSdk.get(options);

    sinon
      .stub(s3, 'listObjectsV2')
      .returns({ promise: sinon.stub().returns({ Contents: [{ Key: 'key' }] }) });
    sinon.stub(s3, 'deleteObjects').returns({ promise: sinon.stub() });

    const service = new S3Storage({ s3, bucketName });
    const params = {
      Bucket: bucketNameMock,
      Prefix: 'prefix',
    };
    const deleteParams = {
      Bucket: bucketNameMock,
      Delete: { Objects: [{ Key: 'key' }] },
    };

    await service.delete(params.Prefix);

    expect(s3.listObjectsV2).to.be.calledWith(params);
    expect(s3.deleteObjects).to.be.calledWith(deleteParams);
  });
});
