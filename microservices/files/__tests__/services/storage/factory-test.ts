import { RemoteConfig } from '@lomray/microservice-helpers';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import StorageType from '@constants/storage-type';
import S3AwsSdk from '@services/external/s3-aws-sdk';
import Factory from '@services/storage/factory';
import S3 from '@services/storage/s3';

describe('services/storage/factory', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully create S3 storage instance', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});

    const configSpy = sandbox.spy(S3AwsSdk, 'get');
    const service = await Factory.create(StorageType.s3);

    expect(service).instanceof(S3);
    expect(configSpy).to.calledOnce;
  });

  it('should throw error: Not implemented', async () => {
    // @ts-ignore
    const service = Factory.create('unknown');

    expect(await waitResult(service)).to.throw('Not implemented');
  });
});
