import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalConfigRemove from '@methods/config/remove';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalConfigRemove;
}>(() => require('@methods/config/remove'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/remove', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Remove({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });
});
