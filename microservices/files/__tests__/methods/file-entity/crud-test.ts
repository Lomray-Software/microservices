import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  removeResult,
  createResult,
  updateResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import FileEntity from '@entities/file-entity';
import OriginalFileEntityCrud from '@methods/file-entity/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalFileEntityCrud;
}>(() => require('@methods/file-entity/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/file-entity/crud', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly return count', async () => {
    const res = await Crud.count?.({}, endpointOptions);

    expect(res).to.deep.equal(countResult());
  });

  it('should correctly entity create', async () => {
    const fields = {
      entityId: 'entity_id',
      fileId: 'file_id',
      microservice: 'microservice',
      type: 'type',
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(FileEntity).create({
      entityId: 'file_entity_id',
    });

    const fields = {
      entityId: 'entity_id',
      fileId: 'file_id',
      microservice: 'microservice',
      type: 'type',
    };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { entityId: 'entity_id' } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 'entity_id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.(
      { query: { where: { entityId: 'entity_id' } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(removeResult([entity]));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });

  it("should haven't list method", () => {
    expect(Crud.list).to.be.undefined;
  });

  it("should haven't view method", () => {
    expect(Crud.view).to.be.undefined;
  });
});
