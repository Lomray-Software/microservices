import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  removeResult,
  createResult,
  updateResult,
  listResult,
  viewResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import Notice from '@entities/notice';
import OriginalNoticeCrud from '@methods/notice/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalNoticeCrud;
}>(() => require('@methods/notice/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/notice/crud', () => {
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
    const fields: Partial<Notice> = {
      type: 'notice',
      title: 'Folder',
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(Notice).create({
      id: 'id',
      type: 'type',
      title: 'title',
    });

    const fields: Partial<Notice> = {
      isViewed: true,
    };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { id: 'id' } } }, endpointOptions);

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 'id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: 'id' } } }, endpointOptions);

    expect(res).to.deep.equal(removeResult([entity]));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
