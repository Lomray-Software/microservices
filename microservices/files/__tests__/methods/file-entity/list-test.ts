import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalFileEntityList from '@methods/file-entity/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalFileEntityList;
}>(() => require('@methods/file-entity/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file-entity/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
