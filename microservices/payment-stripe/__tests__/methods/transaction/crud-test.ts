import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  listResult,
  viewResult,
  endpointOptions,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import OriginalCrud from '@methods/transaction/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalCrud;
}>(() => require('@methods/transaction/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/transaction/crud', () => {
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
    const entity = { transactionId: 'transaction-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.(
      { query: { where: { transactionId: entity.transactionId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(viewResult(entity));
  });

  it("should haven't create method", () => {
    [Crud.create, Crud.remove, Crud.update, Crud.restore].forEach(
      (method) => expect(method).to.be.undefined,
    );
  });
});
