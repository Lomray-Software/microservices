import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import AttachmentType from '@constants/attachment-type';
import { IMAGE_CONFIG_FROM_CONFIG_MS, IMAGE_PROCESSING_CONFIG } from '@constants/index';
import StorageType from '@constants/storage-type';
import Attachment from '@entities/attachment';
import Image from '@services/attachment/image';
import ImageProcessingConfig from '@services/external/image-processing-config';
import StorageFactory from '@services/storage/factory';

describe('services/attachment/image', () => {
  const BUCKET_NAME = 'bucket-name';
  const attachmentData = {
    id: 'attachment_id',
  };

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should successfully save image', async () => {
    TypeormMock.entityManager.save.resolves(attachmentData);
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: BUCKET_NAME } });

    const storage = await StorageFactory.create(StorageType.s3);
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: IMAGE_CONFIG_FROM_CONFIG_MS,
      config: IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(AttachmentType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(service, <any>'composeData').resolves({
      attachmentData: { url: 'url', type: AttachmentType.image },
      formattedImages: [],
    });

    sandbox.stub(service, <any>'uploadImages');

    const entity = await service.save('file', 'user_id');

    const [, attachment] = TypeormMock.entityManager.save.firstCall.args;

    expect(entity).to.deep.equal(attachmentData);
    expect(attachment).to.deep.equal({
      userId: 'user_id',
      url: '/',
      type: AttachmentType.image,
    });
  });

  it('should successfully remove image', async () => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: BUCKET_NAME } });

    const storage = await StorageFactory.create('S3');
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: IMAGE_CONFIG_FROM_CONFIG_MS,
      config: IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(AttachmentType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(storage, 'delete');

    const isRemoved = await service.remove(attachmentData.id);

    const [, attachmentId] = TypeormMock.entityManager.delete.firstCall.args;

    expect(isRemoved).to.ok;
    expect(attachmentId).to.deep.equal(attachmentData.id);
  });

  it('should successfully update image', async () => {
    const attachment = {
      id: attachmentData.id,
    } as Attachment;

    TypeormMock.entityManager.save.resolves(attachmentData);
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: { bucketName: BUCKET_NAME } });

    const storage = await StorageFactory.create('S3');
    const config = await ImageProcessingConfig.get({
      isFromConfigMs: IMAGE_CONFIG_FROM_CONFIG_MS,
      config: IMAGE_PROCESSING_CONFIG,
    });

    const service = new Image(AttachmentType.image, TypeormMock.entityManager, storage, config);

    sandbox.stub(service, <any>'composeData').resolves({
      attachmentData: { url: 'url', type: AttachmentType.image },
      formattedImages: [],
    });

    sandbox.stub(service, <any>'uploadImages');

    sandbox.stub(storage, 'delete');

    const entity = await service.update(attachmentData.id, 'file', attachment);

    const [, attachmentEntity] = TypeormMock.entityManager.save.firstCall.args;

    expect(entity).to.deep.equal(attachmentData);
    expect(attachmentEntity).to.deep.equal({
      userId: 'user_id',
      url: '/',
      type: AttachmentType.image,
    });
  });
});
