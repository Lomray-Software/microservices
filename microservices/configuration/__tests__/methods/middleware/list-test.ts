import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalMiddlewareList from '@methods/middleware/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareList;
}>(() => require('@methods/middleware/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
