import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalUserRoleRemove from '@methods/user-role/remove';

const { default: Remove } = rewiremock.proxy<{
  default: typeof OriginalUserRoleRemove;
}>(() => require('@methods/user-role/remove'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user-role/remove', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly remove entity', async () => {
    const entity = { userId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Remove({ query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });
});
