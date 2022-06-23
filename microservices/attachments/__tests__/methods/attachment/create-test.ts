import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import StorageStub from '@__mocks__/storage-stub';
import AttachmentType from '@constants/attachment-type';
import Attachment from '@entities/attachment';
import OriginalEndpointCreate from '@methods/attachment/create';
import Factory from '@services/attachment/factory';
import StorageFactory from '@services/storage/factory';

const { default: Create } = rewiremock.proxy<{
  default: typeof OriginalEndpointCreate;
}>(() => require('@methods/attachment/create'), {
  typeorm: TypeormMock.mock,
});

describe('methods/attachment/create', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = Create({}, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly create attachment', async () => {
    let serviceParams: Parameters<typeof Factory.create> | undefined;
    let sendStub;

    sandbox.stub(RemoteConfig, 'get').resolves({});

    const methodParams = {
      file: 'file',
      userId: 'user_id',
      alt: 'alt',
      type: AttachmentType.image,
    };

    const attachment = {
      id: 'attachment_id',
      url: 'url',
      userId: methodParams.userId,
      alt: methodParams.alt,
    };

    const serviceStub = sandbox.stub(Factory, 'create').callsFake(async (...args) => {
      serviceStub.restore();

      sandbox.stub(StorageFactory, 'create').resolves(StorageStub);

      const factory = await Factory.create(...args);

      serviceParams = args;
      sendStub = sandbox.stub(factory, 'save').resolves(attachment as Attachment);

      return factory;
    });

    const res = await Create(methodParams, endpointOptions);

    expect(res).to.deep.equal({ entity: attachment });
    expect(serviceParams?.[0]).to.be.equal(AttachmentType.image);
    expect(serviceParams?.[1]).to.deep.equal(TypeormMock.entityManager);
    expect(sendStub).to.calledOnceWith(methodParams.file, methodParams.userId, methodParams.alt);
  });
});
