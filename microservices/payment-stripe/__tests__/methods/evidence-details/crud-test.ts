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
import { evidenceDetailsMock } from '@__mocks__/evidence-details';
import OriginalEvidenceDetailsCrud from '@methods/evidence-details/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalEvidenceDetailsCrud;
}>(() => require('@methods/evidence-details/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/evidence-details/crud', () => {
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
    const entity = { disputeId: evidenceDetailsMock.disputeId };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.(
      { query: { where: { disputeId: entity.disputeId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity create', async () => {
    TypeormMock.entityManager.save.resolves([evidenceDetailsMock]);

    const res = await Crud.create?.({ fields: evidenceDetailsMock }, endpointOptions);

    expect(res).to.deep.equal(createResult(evidenceDetailsMock));
  });

  it('should correctly entity update', async () => {
    const fields = { submissionCount: evidenceDetailsMock.submissionCount + 1 };

    TypeormMock.queryBuilder.getMany.returns([evidenceDetailsMock]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.(
      { fields, query: { where: { disputeId: evidenceDetailsMock.disputeId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal(updateResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity = { disputeId: evidenceDetailsMock.disputeId };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.(
      { query: { where: { disputeId: evidenceDetailsMock.disputeId } } },
      endpointOptions,
    );

    expect(res).to.deep.equal({ deleted: [entity] });
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
