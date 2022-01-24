import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  countResult,
  endpointOptions,
  listResult,
} from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getRepository } from 'typeorm';
import Method from '@entities/method';
import OriginalEndpointCrud from '@methods/endpoint/crud';

const { default: Crud } = rewiremock.proxy<{
  default: typeof OriginalEndpointCrud;
}>(() => require('@methods/endpoint/crud'), {
  typeorm: TypeormMock.mock,
});

describe('methods/endpoint/crud', () => {
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

    const res = await Crud.view?.({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(entity);
  });

  it('should correctly entity create', async () => {
    const fields = {
      microservice: 'demo',
      method: 'endpoint.add',
    };

    TypeormMock.entityManager.save.resolves([fields]);

    const res = await Crud.create?.({ fields }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });

  it('should correctly entity update', async () => {
    const entity = getRepository(Method).create({
      id: 1,
      microservice: 'demo',
      method: 'endpoint.add',
    });
    const fields = { method: 'endpoint.remove' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Crud.update?.({ fields, query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });

  it('should correctly entity remove', async () => {
    const entity = { id: 1 };

    TypeormMock.queryBuilder.getMany.returns([entity]);

    const res = await Crud.remove?.({ query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal({ deleted: [entity] });
  });

  it("should haven't restore method", () => {
    expect(Crud.restore).to.be.undefined;
  });
});
