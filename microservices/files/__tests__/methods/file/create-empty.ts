import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import StorageStub from '@__mocks__/storage-stub';
import FileType from '@constants/file-type';
import File from '@entities/file';
import OriginalEndpointCreateEmpty from '@methods/file/create-empty';
import Factory from '@services/file/factory';
import StorageFactory from '@services/storage/factory';

const { default: CreateEmpty } = rewiremock.proxy<{
  default: typeof OriginalEndpointCreateEmpty;
}>(() => require('@methods/file/create-empty'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file/create-empty', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = CreateEmpty({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly create file', async () => {
    let serviceParams: Parameters<typeof Factory.create> | undefined;
    let saveStub;

    sandbox.stub(RemoteConfig, 'get').resolves({});

    const methodParams = {
      fileName: 'file.mp4',
      userId: 'user_id',
      alt: 'alt',
      type: FileType.video,
    };
    const file = {
      id: 'file_id',
      url: 'url',
      userId: methodParams.userId,
      alt: methodParams.alt,
    };

    const serviceStub = sandbox.stub(Factory, 'create').callsFake(async (...args) => {
      serviceStub.restore();

      sandbox.stub(StorageFactory, 'create').resolves(StorageStub);

      const service = await Factory.create(...args);

      serviceParams = args;
      saveStub = sandbox.stub(service, 'save').resolves(file as File);

      return service;
    });

    const res = await CreateEmpty(methodParams, endpointOptions);

    expect(res).to.deep.equal({ entity: file });
    expect(serviceParams?.[0]).to.be.equal(FileType.video);
    expect(serviceParams?.[1]).to.deep.equal(TypeormMock.entityManager);
    expect(saveStub).to.calledOnceWith(
      methodParams.fileName,
      methodParams.userId,
      methodParams.alt,
    );
  });
});
