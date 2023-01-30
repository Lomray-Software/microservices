import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import FileType from '@constants/file-type';
import Factory from '@services/file/factory';
import Image from '@services/file/image';
import StorageFactory from '@services/storage/factory';

describe('services/file/factory', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create Image instance', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});
    sandbox.stub(StorageFactory, 'create');

    const service = await Factory.create(FileType.image, TypeormMock.entityManager);

    expect(service).instanceof(Image);
  });

  it('should throw error: Not implemented', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });
    // @ts-ignore
    const service = Factory.create('unknown', TypeormMock.entityManager);

    expect(await waitResult(service)).to.throw('Not implemented');
  });
});
