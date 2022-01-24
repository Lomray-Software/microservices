import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  listResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import MethodFilter, { FilterOperator } from '@entities/method-filter';
import OriginalEndpointFilterCrud from '@methods/endpoint-filter/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalEndpointFilterCrud;
}>(() => require('@methods/endpoint-filter/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/endpoint-filter/crud', () => {
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
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { methodId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(entity);
  });

  it('should correctly entity create', async () => {
    const fields = {
      methodId: 1,
      filterId: 2,
      roleAlias: 'users',
      operator: FilterOperator.and,
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(MethodFilter).create({
      methodId: 1,
      filterId: 1,
      roleAlias: 'users',
      operator: FilterOperator.and,
    });
    const fields = { operator: FilterOperator.only };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { methodId: 1, filterId: 1 } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(fields);
  });

  it('should correctly entity remove', async () => {
    const entity = { methodId: 1, filterId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.(
      { query: { where: { methodId: 1, filterId: 1 } } },
      endpointOptions,
    );

    expect(res).to.deep.equal({ deleted: [entity] });
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
