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
import Folder from '@entities/folder';
import OriginalFolderCrud from '@methods/folder/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalFolderCrud;
}>(() => require('@methods/folder/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/folder/crud', () => {
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
    const fields: Partial<Folder> = {
      title: 'Folder',
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(Folder).create({
      id: 'id',
      title: 'Title',
      alias: 'alias',
    });

    const fields: Partial<Folder> = {
      alias: 'aliasSecond',
    };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { id: 'id' } } }, endpointOptions);

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 'folderId' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: 'folderId' } } }, endpointOptions);

    expect(res).to.deep.equal(removeResult([entity]));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
