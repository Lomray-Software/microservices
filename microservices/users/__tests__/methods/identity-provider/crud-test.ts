import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  listResult,
  removeResult,
  restoreResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import IdProvider from '@constants/id-provider';
import IdentityProvider from '@entities/identity-provider';
import OriginalIdentityProviderCrud from '@methods/identity-provider/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalIdentityProviderCrud;
}>(() => require('@methods/identity-provider/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/identity-provider/crud', () => {
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
    const entity = { userId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(entity);
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(IdentityProvider).create({
      userId: 'test-1',
      provider: IdProvider.FIREBASE,
      identifier: 'identifier-123',
      type: 'google',
    });
    const fields = { type: 'github' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });

  it('should correctly entity remove', async () => {
    const entity = { userId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(removeResult([entity]));
  });

  it('should correctly entity restore', async () => {
    const entity = { userId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.recover.returns([entity]);

    const res = await Crud.restore?.({ query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(restoreResult([entity]));
  });
});
