import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalEventChangeAttachment from '@events/user/attachment-removed';
import { IAttachment } from '@interfaces/microservices/attachments/entities/attachment';
import type IAttachmentEntity from '@interfaces/microservices/attachments/entities/attachment-entity';

const { default: RemoveAttachment } = rewiremock.proxy<{
  default: typeof OriginalEventChangeAttachment;
}>(() => require('@events/user/attachment-removed'), {
  typeorm: TypeormMock.mock,
});

describe('events/user/attachment-removed', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const attachmentEntity: IAttachmentEntity = {
    id: 'demo-id',
    attachmentId: 'demo-attachment-id',
    entityId: 'demo-entity-id',
    order: 1,
    type: 'user',
    microservice: 'users',
  };

  const attachment: IAttachment = {
    id: 'demo-id',
    url: 'https://demo-url.com/image.jpg',
    userId: null,
    type: 'image',
    alt: '',
    formats: {} as IAttachment['formats'],
    meta: {
      mime: '',
      hasWebp: false,
    },
    createdAt: '',
    updatedAt: '',
    attachmentEntities: [attachmentEntity],
  };

  it('should skip if attachment entity is not related with user', async () => {
    const isSkip = await RemoveAttachment(
      { entity: { ...attachment, attachmentEntities: [{ ...attachmentEntity, type: 'other' }] } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should remove user photo if entity attachment has removed', async () => {
    const isRemoved = await RemoveAttachment(
      {
        entity: attachment,
      },
      endpointOptions,
    );

    const [, criteria, fields] = TypeormMock.entityManager.update.firstCall.args;

    expect(isRemoved).to.true;
    expect(criteria).to.deep.equal({ userId: attachmentEntity.entityId });
    expect(fields).to.deep.equal({ photo: null });
  });
});
