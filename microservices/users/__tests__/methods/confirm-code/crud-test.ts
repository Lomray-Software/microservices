import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  createResult,
  endpointOptions,
  listResult,
  removeResult,
  viewResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import ConfirmCode from '@entities/confirm-code';
import OriginalCrudConfirmCode from '@methods/confirm-code/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalCrudConfirmCode;
}>(() => require('@methods/confirm-code/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/confirm-code/crud', () => {
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
    const entity: Partial<ConfirmCode> = { login: 'login' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { login: 'login' } } }, endpointOptions);

    expect(res).to.deep.equal(viewResult(entity));
  });

  it('should correctly entity create', async () => {
    const fields: Partial<ConfirmCode> = {
      login: 'login',
      code: 'code',
      expirationAt: 1676313590,
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(createResult(fields));
  });

  it('should correctly entity remove', async () => {
    const entity: Partial<ConfirmCode> = { login: 'login' };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { login: 'login' } } }, endpointOptions);

    expect(res).to.deep.equal(removeResult([entity]));
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });

  it("should haven't update method", () => {
    expect(Crud.update).to.be.undefined;
  });
});
