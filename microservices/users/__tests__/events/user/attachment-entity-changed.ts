import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { IAttachment } from '@lomray/microservices-client-api/interfaces/attachments/entities/attachment';
import type IAttachmentEntity from '@lomray/microservices-client-api/interfaces/attachments/entities/attachment-entity';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import Event from '@constants/event';
import OriginalEventChangeAttachmentEntity from '@events/user/attachment-entity-changed';

const { default: ChangeAttachmentEntity } = rewiremock.proxy<{
  default: typeof OriginalEventChangeAttachmentEntity;
}>(() => require('@events/user/attachment-entity-changed'), {
  typeorm: TypeormMock.mock,
});

describe('events/user/attachment-entity-changed', () => {
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

  const attachment = {
    id: 'demo-id',
    url: 'https://demo-url.com/image.jpg',
  } as IAttachment;

  const acceptCriteria = { userId: attachmentEntity.entityId };
  const acceptFields = { photo: attachment.url };

  it('should skip if attachment entity is not related with user', async () => {
    const isSkip = await ChangeAttachmentEntity(
      { entity: { ...attachmentEntity, type: 'demo' } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should skip if event name unknown', async () => {
    const isSkip = await ChangeAttachmentEntity(
      { entity: { ...attachmentEntity, type: 'demo' }, payload: { eventName: 'unknown' } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should remove user photo if entity attachment has removed', async () => {
    const isChanged = await ChangeAttachmentEntity(
      {
        entity: attachmentEntity,
        payload: { eventName: Event.AttachmentEntityRemove },
      },
      endpointOptions,
    );

    const [, criteria, fields] = TypeormMock.entityManager.update.firstCall.args;

    expect(isChanged).to.true;
    expect(criteria).to.deep.equal(acceptCriteria);
    expect(fields).to.deep.equal({ photo: null });
  });

  it('should update user photo if entity attachment has changed', async () => {
    sandbox
      .stub(Api.get().attachments.attachment, 'view')
      .resolves({ result: { entity: attachment } });

    for (const eventName of [Event.AttachmentEntityCreate, Event.AttachmentEntityUpdate]) {
      const isChanged = await ChangeAttachmentEntity(
        {
          entity: attachmentEntity,
          payload: { eventName },
        },
        endpointOptions,
      );

      const [, criteria, fields] = TypeormMock.entityManager.update.firstCall.args;

      expect(isChanged).to.true;
      expect(criteria).to.deep.equal(acceptCriteria);
      expect(fields).to.deep.equal(acceptFields);
    }
  });

  it('should skip update user photo if attachment has not url', async () => {
    sandbox.stub(Api.get().attachments.attachment, 'view').resolves({ result: {} as any });

    const isChanged = await ChangeAttachmentEntity(
      {
        entity: attachmentEntity,
        payload: { eventName: Event.AttachmentEntityCreate },
      },
      endpointOptions,
    );

    expect(isChanged).to.false;
    expect(TypeormMock.entityManager.update).to.not.called;
  });
});
