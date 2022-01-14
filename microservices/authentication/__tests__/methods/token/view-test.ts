import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalTokenView from '@methods/token/view';

const { default: View } = rewiremock.proxy<{
  default: typeof OriginalTokenView;
}>(() => require('@methods/token/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/token/view', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await View({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(entity);
  });
});
