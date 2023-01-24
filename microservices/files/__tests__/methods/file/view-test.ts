import { RemoteConfig } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, viewResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import StorageStub from '@__mocks__/storage-stub';
import OriginalFileView from '@methods/file/view';
import StorageFactory from '@services/storage/factory';

const { default: View } = rewiremock.proxy<{
  default: typeof OriginalFileView;
}>(() => require('@methods/file/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file/view', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 1 };

    sandbox.stub(RemoteConfig, 'get').resolves({});
    sandbox.stub(StorageFactory, 'create').resolves(StorageStub);

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await View({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });
});
