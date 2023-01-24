import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { IFile } from '@lomray/microservices-client-api/interfaces/files/entities/file';
import type IFileEntity from '@lomray/microservices-client-api/interfaces/files/entities/file-entity';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalEventChangeFile from '@events/user/file-removed';

const { default: RemoveFile } = rewiremock.proxy<{
  default: typeof OriginalEventChangeFile;
}>(() => require('@events/user/file-removed'), {
  typeorm: TypeormMock.mock,
});

describe('events/user/file-removed', () => {
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

  const file: IFile = {
    id: 'demo-id',
    url: 'https://demo-url.com/image.jpg',
    userId: null,
    type: 'image',
    alt: '',
    formats: {} as IFile['formats'],
    meta: {
      mime: '',
      hasWebp: false,
    },
    createdAt: '',
    updatedAt: '',
    fileEntities: [fileEntity],
  };

  it('should skip if file entity is not related with user', async () => {
    const isSkip = await RemoveFile(
      { entity: { ...file, fileEntities: [{ ...fileEntity, type: 'other' }] } },
      endpointOptions,
    );

    expect(isSkip).to.false;
  });

  it('should remove user photo if entity file has removed', async () => {
    const isRemoved = await RemoveFile(
      {
        entity: file,
      },
      endpointOptions,
    );

    const [, criteria, fields] = TypeormMock.entityManager.update.firstCall.args;

    expect(isRemoved).to.true;
    expect(criteria).to.deep.equal({ userId: fileEntity.entityId });
    expect(fields).to.deep.equal({ photo: null });
  });
});
