import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import { bucketNameMock } from '@__mocks__/common';
import FileType from '@constants/file-type';
import CONST from '@constants/index';
import File from '@entities/file';
import EmptyFile from '@services/file/empty-file';
import StorageFactory from '@services/storage/factory';

describe('services/file/empty-file', () => {
  const sandbox = sinon.createSandbox();
  const fileData = getRepository(File).create({
    id: 'file_id',
  });
  const resultFile = {
    id: 'file_id',
    type: FileType.video,
    meta: { mime: 'video/mp4' },
  };

  /**
   * Create service
   */
  const getService = async (): Promise<EmptyFile> => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: bucketNameMock } });

    const storage = await StorageFactory.create();

    return new EmptyFile(FileType.video, TypeormMock.entityManager, storage, {
      storagePathPrefix: CONST.STORAGE_PATH_PREFIX,
    });
  };

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully save file', async () => {
    // first call - create empty file
    TypeormMock.entityManager.save.onFirstCall().resolves(fileData);
    // second call - return from transaction
    TypeormMock.entityManager.save.onSecondCall().callsFake((_, entity) => entity);

    const service = await getService();
    const entity = await service.save('file.mp4', 'user_id');

    const [, file] = TypeormMock.entityManager.save.secondCall.args;

    const fileUrl = entity.url;

    expect(fileUrl.startsWith(`/${fileData.id}`)).to.true;
    expect(fileUrl.endsWith('.mp4')).to.true;
    expect(entity).to.deep.equal({
      ...resultFile,
      url: fileUrl,
    });
    expect(file).to.deep.equal({
      ...resultFile,
      url: fileUrl,
    });
  });

  it('should throw error remove file', async () => {
    const service = await getService();

    expect(() => service.remove()).to.throw('Use files.file.remove instead.');
  });

  it('should throw update file', async () => {
    const service = await getService();

    expect(() => service.remove()).to.throw('Use files.file.remove instead.');
  });
});
