import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import Profile from '@entities/profile';
import OriginalProfileCrud from '@methods/profile/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalProfileCrud;
}>(() => require('@methods/profile/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/profile/crud', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly entity view', async () => {
    const entity = { userId: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.view?.({ query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(entity);
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(Profile).create({
      userId: 'test-1',
      birthDay: '2022-01-01',
    });
    const fields = { birthDay: '2022-02-02' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { userId: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });

  it("should haven't remove method", () => {
    expect(Crud.remove).to.be.undefined;
  });

  it("should haven't create method", () => {
    expect(Crud.create).to.be.undefined;
  });

  it("should haven't list method", () => {
    expect(Crud.list).to.be.undefined;
  });

  it("should haven't count method", () => {
    expect(Crud.count).to.be.undefined;
  });
});
