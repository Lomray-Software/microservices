import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import AttachmentType from '@constants/attachment-type';
import OriginalEndpointRemove from '@methods/attachment/remove';
import Factory from '@services/attachment/factory';
import StorageFactory from '@services/storage/factory';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalEndpointRemove;
}>(() => require('@methods/attachment/remove'), {
  typeorm: TypeormMock.mock,
});

describe('methods/attachment/remove', () => {
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

    const res = Remove({ id: 'id' }, endpointOptions);

    expect(await waitResult(res)).to.throw('The requested resource was not found');
  });

  it('should correctly remove attachment', async () => {
    let serviceParams: Parameters<typeof Factory.create> | undefined;
    let sendStub;

    sandbox.stub(RemoteConfig, 'get').resolves({});

    const methodParams = {
      id: 'attachment_id',
    };

    const attachment = {
      id: methodParams.id,
      url: 'url',
      type: AttachmentType.image,
    };

    TypeormMock.entityManager.findOne.resolves(attachment);

    const serviceStub = sandbox.stub(Factory, 'create').callsFake(async (...args) => {
      serviceStub.restore();

      sandbox.stub(StorageFactory, 'create');

      const factory = await Factory.create(...args);

      serviceParams = args;
      sendStub = sandbox.stub(factory, 'remove').resolves(true);

      return factory;
    });

    const res = await Remove(methodParams, endpointOptions);

    expect(res).to.deep.equal({ isRemoved: true });
    expect(serviceParams?.[0]).to.be.equal(AttachmentType.image);
    expect(serviceParams?.[1]).to.deep.equal(TypeormMock.entityManager);
    expect(sendStub).to.calledOnceWith(methodParams.id);
  });
});
