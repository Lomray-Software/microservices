import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  listResult,
  viewResult,
  updateResult,
  endpointOptions,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { customerMock } from '@__mocks__/customer';
import OriginalCrud from '@methods/customer/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalCrud;
}>(() => require('@methods/customer/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/customer/crud', () => {
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
    const entity = { customerId: 'customer-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.(
      { query: { where: { customerId: entity.customerId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity update', async () => {
    const fields = { params: { accountId: 'acct_1ND9ZWFv0icWNHgh' } };

    TypeormMock.queryBuilder.getMany.returns([customerMock]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { customerId: customerMock.customerId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
