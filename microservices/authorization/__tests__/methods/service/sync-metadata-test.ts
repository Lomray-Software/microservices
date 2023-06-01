import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { EntityManager } from 'typeorm';
import COMMON_MODELS from '@constants/common-models';
import OriginalEndpointSyncMetadata from '@methods/service/sync-metadata';
import MethodsImporter from '@services/methods-importer';

const { default: SyncMetadata } = rewiremock.proxy<{
  default: typeof OriginalEndpointSyncMetadata;
}>(() => require('@methods/service/sync-metadata'), {
  typeorm: TypeormMock.mock,
});

describe('methods/service/sync-metadata', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: validation failed', async () => {
    // @ts-ignore
    const res = SyncMetadata({ commonModelAliases: 1 }, endpointOptions);

    expect(await waitResult(res)).to.throw('Invalid request params');
  });

  it('should correctly synchronize metadata', async () => {
    let serviceParams: Parameters<typeof MethodsImporter.create> | undefined;
    let importStub;

    const microservices = { msName: { isSuccess: true } };
    const serviceStub = sandbox.stub(MethodsImporter, 'create').callsFake((...args) => {
      serviceStub.restore();

      const service = MethodsImporter.create(...args);

      serviceParams = args;
      importStub = sandbox.stub(service, 'import').resolves(microservices);

      return service;
    });
    const methodParams = {
      defaultSchemaRoles: ['admin'],
      defaultAllowGroup: ['admin'],
      commonModelAliases: ['Alias'],
    };

    const res = await SyncMetadata(methodParams, endpointOptions);

    const [msInstance, managerInstance, params] = serviceParams ?? [];

    expect(res).to.deep.equal({ microservices });
    expect(msInstance).to.deep.equal(endpointOptions.app);
    expect(managerInstance).to.instanceof(EntityManager);
    expect(params).to.deep.equal({
      ...methodParams,
      commonModelAliases: [...COMMON_MODELS, ...methodParams.commonModelAliases],
    });
    expect(importStub).to.calledOnce;
  });
});
