import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalConfigCreate from '@methods/config/create';

const { default: Create } = rewiremock.proxy<{
  default: typeof OriginalConfigCreate;
}>(() => require('@methods/config/create'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/create', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly create entity', async () => {
    const res = await Create({ fields: { type: 'test', microservice: 'demo' } }, endpointOptions);

    expect(res).to.deep.equal({});
  });

  it('should throw error when we pass empty fields', async () => {
    const failedInput = Create({ fields: {} }, endpointOptions);
    // @ts-ignore
    const failedInput2 = Create({ fields: null }, endpointOptions);
    const failedInput3 = Create({}, endpointOptions);

    expect(await waitResult(failedInput)).to.throw();
    expect(await waitResult(failedInput2)).to.throw();
    expect(await waitResult(failedInput3)).to.throw();
  });
});
