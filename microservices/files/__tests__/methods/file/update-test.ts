import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import StorageStub from '@__mocks__/storage-stub';
import FileType from '@constants/file-type';
import File from '@entities/file';
import OriginalEndpointUpdate from '@methods/file/update';
import Factory from '@services/file/factory';
import StorageFactory from '@services/storage/factory';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalEndpointUpdate;
}>(() => require('@methods/file/update'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file/update', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Remove({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should throw error: The requested resource was not found', async () => {
    TypeormMock.entityManager.findOne.resolves(undefined);

    const methodParams = { id: 'file_id', alt: 'alt', file: 'file' };
    const res = Remove(methodParams, endpointOptions);

    expect(await waitResult(res)).to.throw('The requested file was not found');
  });

  it('should correctly update file', async () => {
    let serviceParams: Parameters<typeof Factory.create> | undefined;
    let sendStub;

    sandbox.stub(RemoteConfig, 'get').resolves({});

    const methodParams = { id: 'file_id', alt: 'alt', file: 'file' };
    const file = {
      id: methodParams.id,
      url: 'url',
      type: FileType.image,
    };

    TypeormMock.entityManager.findOne.resolves(file);

    const serviceStub = sandbox.stub(Factory, 'create').callsFake(async (...args) => {
      serviceStub.restore();

      sandbox.stub(StorageFactory, 'create').resolves(StorageStub);

      const factory = await Factory.create(...args);

      serviceParams = args;
      sendStub = sandbox.stub(factory, 'update').resolves(file as File);

      return factory;
    });

    const res = await Remove(methodParams, endpointOptions);

    expect(res).to.deep.equal({ entity: file });
    expect(serviceParams?.[0]).to.be.equal(FileType.image);
    expect(serviceParams?.[1]).to.deep.equal(TypeormMock.entityManager);
    expect(sendStub).to.calledOnceWith(file, methodParams.file, methodParams.alt);
  });
});
