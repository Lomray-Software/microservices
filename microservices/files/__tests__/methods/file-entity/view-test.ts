import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, viewResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalFileEntityView from '@methods/file-entity/view';

const { default: ViewTest } = rewiremock.proxy<{
  default: typeof OriginalFileEntityView;
}>(() => require('@methods/file-entity/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file-entity/view', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await ViewTest({ query: { where: { entityId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });
});
