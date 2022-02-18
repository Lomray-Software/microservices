import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { countResult, endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalMiddlewareCount from '@methods/middleware/count';

const { default: Count } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareCount;
}>(() => require('@methods/middleware/count'), {
  typeorm: TypeormMock.mock,
});

describe('methods/middleware/count', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return count', async () => {
    const res = await Count({}, endpointOptions);

    expect(res).to.deep.equal(countResult());
  });
});
