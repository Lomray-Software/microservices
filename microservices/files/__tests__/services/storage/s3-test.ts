import { RemoteConfig } from '@lomray/microservice-helpers';
import type { S3 } from 'aws-sdk';
import AWS from 'aws-sdk';
import type { S3Customizations } from 'aws-sdk/lib/services/s3';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import S3Storage from '@services/storage/s3';

describe('services/file/image', () => {
  const s3 = new AWS.S3();
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully upload file', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const uploadStub = sandbox
      .stub(s3, 'upload')
      .returns({ promise: sinon.stub() } as unknown as ReturnType<S3Customizations['upload']>);

    const service = new S3Storage({ s3, bucketName: bucketNameMock });
    const params = {
      Key: 'key',
      Body: new Buffer('file'),
      ContentType: 'image/jpeg',
    };

    await service.upload(params.Key, params.Body, 'image/jpeg');

    expect(uploadStub).to.be.calledWith({ Bucket: bucketNameMock, ...params });
  });

  it('should successfully delete files', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const listObjectsStub = sandbox.stub(s3, 'listObjectsV2').returns({
      promise: sinon.stub().returns({ Contents: [{ Key: 'key' }] }),
    } as unknown as ReturnType<S3['listObjectsV2']>);
    const deleteObjectsStub = sandbox
      .stub(s3, 'deleteObjects')
      .returns({ promise: sinon.stub() } as unknown as ReturnType<S3['deleteObjects']>);

    const service = new S3Storage({ s3, bucketName: bucketNameMock });
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

  it('should correctly handle url', () => {
    const service = new S3Storage({ s3, bucketName: bucketNameMock });
    const testUrl = '/my/test/file.txt';
    const url = service.handleUrl(testUrl);

    expect(url).to.equal(`${service.getDomain()}${testUrl}`);
  });
});
