import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, viewResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import OriginalSingleTypeEntityView from '@methods/single-type/view';

const { default: ViewTest } = rewiremock.proxy<{
  default: typeof OriginalSingleTypeEntityView;
}>(() => require('@methods/single-type/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/single-type/view', () => {
  const sandbox = sinon.createSandbox();
  let requestParams: Record<string, unknown>;

  beforeEach(() => {
    requestParams = { payload: { expand: ['components'] } };

    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 'random-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await ViewTest({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should return the entity if no relations are specified', async () => {
    const entity = { id: 'random-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    requestParams = { payload: { expand: [] } };

    const result = await ViewTest(
      { query: { where: { id: entity.id } }, ...requestParams },
      endpointOptions,
    );

    expect(result).to.deep.equal({ entity });
  });
});
