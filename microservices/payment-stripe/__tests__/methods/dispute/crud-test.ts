import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  createResult,
  listResult,
  viewResult,
  updateResult,
  endpointOptions,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { disputeMock } from '@__mocks__/dispute';
import OriginalDisputeCrud from '@methods/dispute/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalDisputeCrud;
}>(() => require('@methods/dispute/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/dispute/crud', () => {
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
    const entity = { id: disputeMock.id };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity create', async () => {
    TypeormMock.entityManager.save.resolves([disputeMock]);

    const res = await Crud.create?.({ fields: disputeMock }, endpointOptions);

    expect(res).to.deep.equal(createResult(disputeMock));
  });

  it('should correctly entity update', async () => {
    const fields = { amount: disputeMock.amount + 10 };

    TypeormMock.queryBuilder.getMany.returns([disputeMock]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { id: disputeMock.id } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: disputeMock.id };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
