import { RemoteConfig } from '@lomray/microservice-helpers';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import Factory from '@services/storage/factory';
import S3 from '@services/storage/s3';

describe('services/storage/factory', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully create S3 storage instance', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});

    const service = await Factory.create();

    expect(service).instanceof(S3);
  });

  it('should throw error: Not implemented', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ storageType: 'unknown' });
    const service = Factory.create();

    expect(await waitResult(service)).to.throw('Not implemented.');
  });
});
