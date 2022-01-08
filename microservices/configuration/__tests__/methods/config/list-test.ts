import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalConfigList from '@methods/config/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalConfigList;
}>(() => require('@methods/config/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
