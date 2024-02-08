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
import { payoutMock } from '@__mocks__/payout';
import PayoutType from '@constants/payout-type';
import OriginalCrud from '@methods/payout/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalCrud;
}>(() => require('@methods/payout/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/payout/crud', () => {
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
    const entity = { payoutId: 'payout-id' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.(
      { query: { where: { payoutId: entity.payoutId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity update', async () => {
    const fields = { type: PayoutType.BANK_ACCOUNT };

    TypeormMock.queryBuilder.getMany.returns([payoutMock]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { payoutId: 'payout-id' } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });

  it("should haven't create method", () => {
    expect(Crud.create).to.be.undefined;
  });
});
