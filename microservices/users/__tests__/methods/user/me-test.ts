import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, viewResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalUserMe from '@methods/user/me';

const { default: Me } = rewiremock.proxy<{
  default: typeof OriginalUserMe;
}>(() => require('@methods/user/me'), {
  typeorm: TypeormMock.mock,
});

describe('methods/user/me', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly entity view', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Me?.({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });
});
