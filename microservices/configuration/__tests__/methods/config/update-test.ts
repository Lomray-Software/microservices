import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getCustomRepository } from 'typeorm';
import OriginalConfigUpdate from '@methods/config/update';
import ConfigRepository from '@repositories/config-repository';

const { default: Update } = rewiremock.proxy<{
  default: typeof OriginalConfigUpdate;
}>(() => require('@methods/config/update'), {
  typeorm: TypeormMock.mock,
});

describe('methods/config/update', () => {
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly update entity', async () => {
    const entity = getCustomRepository(ConfigRepository).create({
      id: 1,
      type: 'test',
      microservice: 'demo',
    });
    const fields = { type: 'test2', microservice: 'demo2' };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Update({ fields, query: { where: { id: 1 } } }, endpointOptions);

    expect(res).to.deep.equal(fields);
  });
});
