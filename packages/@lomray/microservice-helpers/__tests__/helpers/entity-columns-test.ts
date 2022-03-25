import { expect } from 'chai';
import sinon from 'sinon';
import TestEntity from '@__mocks__/entities/test-entity';
import EntityColumns from '@helpers/entity-columns';
import { TypeormMock } from '@mocks/index';

describe('helpers/entity-columns', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(TestEntity);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return entity columns', () => {
    const columns = EntityColumns(repository);

    expect(columns).to.deep.equal(['id', 'param']);
  });
});
