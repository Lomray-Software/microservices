import { RemoteConfig } from '@lomray/microservice-helpers';
import type { S3 } from 'aws-sdk';
import type { S3Customizations } from 'aws-sdk/lib/services/s3';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import S3AwsSdk from '@services/external/s3-aws-sdk';
import S3Storage from '@services/storage/s3';

describe('services/file/image', () => {
  const options = {
    isFromConfigMs: true,
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

    const uploadStub = sandbox
      .stub(s3, 'upload')
      .returns({ promise: sinon.stub() } as unknown as ReturnType<S3Customizations['upload']>);

    const service = new S3Storage({ s3, bucketName });
    const params = {
      Key: 'key',
      Body: new Buffer('file'),
      ContentType: 'image/jpeg',
    };

    await service.upload(params.Key, params.Body, 'image/jpeg');

    expect(uploadStub).to.be.calledWith({ Bucket: bucketNameMock, ...params });
  });

  it('should successfully delete files', async () => {
    S3AwsSdk.reset();

    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const { s3, bucketName } = await S3AwsSdk.get(options);

    const listObjectsStub = sandbox.stub(s3, 'listObjectsV2').returns({
      promise: sinon.stub().returns({ Contents: [{ Key: 'key' }] }),
    } as unknown as ReturnType<S3['listObjectsV2']>);
    const deleteObjectsStub = sandbox
      .stub(s3, 'deleteObjects')
      .returns({ promise: sinon.stub() } as unknown as ReturnType<S3['deleteObjects']>);

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

    expect(listObjectsStub).to.be.calledWith(params);
    expect(deleteObjectsStub).to.be.calledWith(deleteParams);
  });

  it('should correctly handle url', async () => {
    const { s3, bucketName } = await S3AwsSdk.get(options);
    const service = new S3Storage({ s3, bucketName });
    const testUrl = '/my/test/file.txt';
    const url = service.handleUrl(testUrl);

    expect(url).to.equal(`${service.getDomain()}${testUrl}`);
  });
});
