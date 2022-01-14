import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalTokenList from '@methods/token/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalTokenList;
}>(() => require('@methods/token/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/token/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
