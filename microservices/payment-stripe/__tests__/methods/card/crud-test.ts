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
import { cardMock } from '@__mocks__/card';
import OriginalCrud from '@methods/card/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalCrud;
}>(() => require('@methods/card/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/card/crud', () => {
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
    const entity = { id: 'card-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity create', async () => {
    TypeormMock.entityManager.save.resolves([cardMock]);

    const res = await Crud.create?.({ fields: cardMock }, endpointOptions);

    expect(res).to.deep.equal(createResult(cardMock));
  });

  it('should correctly entity update', async () => {
    const fields = { lastDigits: '4343' };

    TypeormMock.queryBuilder.getMany.returns([cardMock]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { id: cardMock.id } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 'card-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
