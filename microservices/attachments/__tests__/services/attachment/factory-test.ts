import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import AttachmentType from '@constants/attachment-type';
import Factory from '@services/attachment/factory';
import Image from '@services/attachment/image';
import ImageProcessingConfig from '@services/external/image-processing-config';
import StorageFactory from '@services/storage/factory';

describe('services/attachment/factory', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create Image instance', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});
    sandbox.stub(StorageFactory, 'create');

    const configSpy = sandbox.spy(ImageProcessingConfig, 'get');
    const service = await Factory.create(AttachmentType.image, TypeormMock.entityManager);

    expect(service).instanceof(Image);
    expect(configSpy).to.calledOnce;
  });

  it('should throw error: Not implemented', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: 'bucket-name' } });
    // @ts-ignore
    const service = Factory.create('unknown', TypeormMock.entityManager);

    expect(await waitResult(service)).to.throw('Not implemented');
  });
});
