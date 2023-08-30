import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  listResult,
  removeResult,
  viewResult,
  createResult,
  updateResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import { articleMock } from '@__mocks__/article';
import Article from '@entities/article';
import OriginalArticleCrud from '@methods/article/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalArticleCrud;
}>(() => require('@methods/article/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/article/crud', () => {
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
      ...articleMock,
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly publish article', async () => {
    const fields = {
      ...articleMock,
      publishDate: new Date().toISOString(),
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(Article).create({
      ...articleMock,
    });
    const fields = { title: 'Bloom' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { id: 'id' } } }, endpointOptions);

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly unpublish article', async () => {
    const entity = getRepository(Article).create({
      ...articleMock,
      publishDate: new Date().toISOString(),
    });
    const fields = { publishDate: null };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { id: 'id' } } }, endpointOptions);

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 'test-id-1' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(removeResult([entity]));
  });
});
