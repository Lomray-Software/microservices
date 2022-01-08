import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { countResult, endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalConfigCount from '@methods/config/count';

const { default: Count } = rewiremock.proxy<{
  default: typeof OriginalConfigCount;
}>(() => require('@methods/config/count'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/count', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return count', async () => {
    const res = await Count({}, endpointOptions);

    expect(res).to.deep.equal(countResult());
  });
});
