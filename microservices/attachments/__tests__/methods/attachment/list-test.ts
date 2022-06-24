import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, listResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalAttachmentList from '@methods/attachment/list';

const { default: List } = rewiremock.proxy<{
  default: typeof OriginalAttachmentList;
}>(() => require('@methods/attachment/list'), {
  typeorm: TypeormMock.mock,
});

describe('methods/attachment/list', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return list', async () => {
    const res = await List({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });
});
