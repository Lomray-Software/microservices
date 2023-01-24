import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import { bucketNameMock } from '@__mocks__/common';
import FileType from '@constants/file-type';
import CONST from '@constants/index';
import StorageType from '@constants/storage-type';
import File from '@entities/file';
import ImageProcessingConfig from '@services/external/image-processing-config';
import Image from '@services/file/image';
import StorageFactory from '@services/storage/factory';

describe('services/file/image', () => {
  const fileData = getRepository(File).create({
    id: 'file_id',
  });

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully save image', async () => {
    TypeormMock.entityManager.save.resolves(fileData);
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const storage = await StorageFactory.create(StorageType.s3);
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: CONST.IS_IMAGE_CONFIG_FROM_CONFIG_MS,
      config: CONST.IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(FileType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(service, <any>'composeData').resolves({
      fileData: { url: 'url', type: FileType.image },
      formattedImages: [],
    });

    sandbox.stub(service, <any>'uploadImages');

    const entity = await service.save('file', 'user_id');

    const [, file] = TypeormMock.entityManager.save.firstCall.args;

    expect(entity).to.deep.equal(fileData);
    expect(file).to.deep.equal({
      userId: 'user_id',
      url: '/',
      type: FileType.image,
    });
  });

  it('should successfully remove image', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const storage = await StorageFactory.create('S3');
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: CONST.IS_IMAGE_CONFIG_FROM_CONFIG_MS,
      config: CONST.IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(FileType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(storage, 'delete');

    const isRemoved = await service.remove(fileData);

    const [, file] = TypeormMock.entityManager.remove.firstCall.args;

    expect(isRemoved).to.ok;
    expect(file).to.deep.equal(fileData);
  });

  it('should successfully update image', async () => {
    TypeormMock.entityManager.save.resolves(fileData);
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const storage = await StorageFactory.create('S3');
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: CONST.IS_IMAGE_CONFIG_FROM_CONFIG_MS,
      config: CONST.IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(FileType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(service, <any>'composeData').resolves({
      fileData: { url: 'url', type: FileType.image },
      formattedImages: [],
    });

    sandbox.stub(service, <any>'uploadImages');

    sandbox.stub(storage, 'delete');

    const entity = await service.update(fileData, 'file');

    const [, fileEntity] = TypeormMock.entityManager.save.firstCall.args;

    expect(entity).to.deep.equal(fileData);
    expect(fileEntity).to.deep.equal({
      userId: 'user_id',
      url: '/',
      type: FileType.image,
    });
  });
});
