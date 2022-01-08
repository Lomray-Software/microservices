import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalConfigView from '@methods/config/view';

const { default: View } = rewiremock.proxy<{
  default: typeof OriginalConfigView;
}>(() => require('@methods/config/view'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/view', () => {
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
