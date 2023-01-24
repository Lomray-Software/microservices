import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { IFile } from '@lomray/microservices-client-api/interfaces/files/entities/file';
import type IFileEntity from '@lomray/microservices-client-api/interfaces/files/entities/file-entity';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import Event from '@constants/event';
import OriginalEventChangeFileEntity from '@events/user/file-entity-changed';

const { default: ChangeFileEntity } = rewiremock.proxy<{
  default: typeof OriginalEventChangeFileEntity;
}>(() => require('@events/user/file-entity-changed'), {
  typeorm: TypeormMock.mock,
});

describe('events/user/file-entity-changed', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const fileEntity: IFileEntity = {
    id: 'demo-id',
    fileId: 'demo-file-id',
    entityId: 'demo-entity-id',
    order: 1,
    type: 'user',
    microservice: 'users',
  };

  const file = {
    id: 'demo-id',
    url: 'https://demo-url.com/image.jpg',
  } as IFile;

  const acceptCriteria = { userId: fileEntity.entityId };
  const acceptFields = { photo: file.url };

  it('should skip if file entity is not related with user', async () => {
    const isSkip = await ChangeFileEntity(
      { entity: { ...fileEntity, type: 'demo' } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should skip if event name unknown', async () => {
    const isSkip = await ChangeFileEntity(
      { entity: { ...fileEntity, type: 'demo' }, payload: { eventName: 'unknown' } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should remove user photo if entity file has removed', async () => {
    const isChanged = await ChangeFileEntity(
      {
        entity: fileEntity,
        payload: { eventName: Event.FileEntityRemove },
      },
      endpointOptions,
    );

    const [, criteria, fields] = TypeormMock.entityManager.update.firstCall.args;

    expect(isChanged).to.true;
    expect(criteria).to.deep.equal(acceptCriteria);
    expect(fields).to.deep.equal({ photo: null });
  });

  it('should update user photo if entity file has changed', async () => {
    sandbox.stub(Api.get().files.file, 'view').resolves({ result: { entity: file } });

    for (const eventName of [Event.FileEntityCreate, Event.FileEntityUpdate]) {
      const isChanged = await ChangeFileEntity(
        {
          entity: fileEntity,
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

  it('should skip update user photo if file has not url', async () => {
    sandbox.stub(Api.get().files.file, 'view').resolves({ result: {} as any });

    const isChanged = await ChangeFileEntity(
      {
        entity: fileEntity,
        payload: { eventName: Event.FileEntityCreate },
      },
      endpointOptions,
    );

    expect(isChanged).to.false;
    expect(TypeormMock.entityManager.update).to.not.called;
  });
});
