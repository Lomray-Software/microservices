import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalTokenRemove from '@methods/token/remove';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalTokenRemove;
}>(() => require('@methods/token/remove'), {
  typeorm: TypeormMock.mock,
});

describe('methods/token/remove', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly remove entity', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Remove({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });
});
