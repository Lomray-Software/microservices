import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  listResult,
  viewResult,
  createResult,
  waitResult,
} from '@lomray/microservice-helpers/test-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import InputType from '@constants/input-type';
import OriginalComponentCrud from '@methods/component/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalComponentCrud;
}>(() => require('@methods/component/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/component/crud', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return count', async () => {
    const res = await Crud.count?.({}, endpointOptions);

    expect(res).to.deep.equal(countResult());
  });

  it('should correctly return list', async () => {
    const res = await Crud.list?.({}, endpointOptions);

    expect(res).to.deep.equal(listResult());
  });

  it('should correctly entity view', async () => {
    const entity = { id: 'test-id-1' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity create', async () => {
    const fields = {
      alias: 'blog',
      title: 'blog',
      schema: [],
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should throw error', async () => {
    const fields = {
      alias: 'blog',
      title: 'blog',
      schema: [
        {
          name: 'wrongName',
          title: 'Wrong title',
          type: InputType.RELATION,
        },
      ],
    };

    TypeormMock.entityManager.save.resolves([fields]);

    expect(await waitResult(Crud.create?.({ fields }, endpointOptions))).to.throw(BaseException);
  });

  it('should correctly entity create with text input', async () => {
    const fields = {
      alias: 'blog',
      title: 'blog',
      schema: [
        {
          name: 'header',
          title: 'Blog title',
          type: InputType.TEXT,
        },
      ],
    };

    TypeormMock.entityManager.save.resolves([fields]);
    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity create with custom inputs', async () => {
    const fields = {
      alias: 'blog',
      title: 'blog',
      schema: [
        {
          name: 'header',
          title: 'Blog title',
          type: InputType.RICH_TEXT,
        },
        {
          name: 'numberOfUser',
          title: 'Number of users',
          type: InputType.NUMBER,
        },
        {
          name: 'usersRelation',
          title: 'Users relation',
          type: InputType.RELATION,
          relation: {
            microservice: 'users',
            entity: 'user',
            fields: [{ name: 'firstName' }],
            hasMany: true,
          },
        },
      ],
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });
});
