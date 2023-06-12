import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import FileType from '@constants/file-type';
import AnyFile from '@services/file/any-file';
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

  it('should successful create AnyFile instance', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});
    sandbox.stub(StorageFactory, 'create');

    const service = await Factory.create(FileType.file, TypeormMock.entityManager);

    expect(service).instanceof(AnyFile);
  });

  it('should successful create AnyFile instance for video', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({});
    sandbox.stub(StorageFactory, 'create');

    const service = await Factory.create(FileType.video, TypeormMock.entityManager);

    expect(service).instanceof(AnyFile);
  });
});
