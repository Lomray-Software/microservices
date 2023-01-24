import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalFileList from '@methods/file/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalFileList;
}>(() => require('@methods/file/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
