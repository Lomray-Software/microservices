import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  createResult,
  endpointOptions,
  listResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalSingleTypeCrud from '@methods/single-type/crud';

const { default: CrudTest } = rewiremock.proxy<{
  default: typeof OriginalSingleTypeCrud;
}>(() => require('@methods/single-type/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/single-type/crud', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return count', async () => {
    const res = await CrudTest.count?.({}, endpointOptions);

    expect(res).to.deep.equal(countResult());
  });

  it('should correctly return list', async () => {
    const res = await CrudTest.list?.({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });

  it('should correctly create entity', async () => {
    const fields = {
      title: 'Blog post type',
      alias: 'blogPostType',
      components: [
        {
          id: '8a77a62c-780a-4e00-8568-f011a6176f9a',
        },
      ],
      value: {
        id: '8a77a62c-780a-4e00-8568-f011a6176f9a',
        data: {
          blogPost: 'Today we gonna talk about Spain',
          numberOfUsers: 10000,
        },
      },
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await CrudTest.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });
});
