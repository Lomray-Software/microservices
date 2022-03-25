import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, viewResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalMiddlewareView from '@methods/middleware/view';

const { default: View } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareView;
}>(() => require('@methods/middleware/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/view', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await View({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });
});
