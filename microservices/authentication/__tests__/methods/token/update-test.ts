import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { endpointOptions, updateResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { getRepository } from 'typeorm';
import TokenType from '@constants/token-type';
import Token from '@entities/token';
import OriginalTokenUpdate from '@methods/token/update';

const { default: Update } = rewiremock.proxy<{
  default: typeof OriginalTokenUpdate;
}>(() => require('@methods/token/update'), {
  typeorm: TypeormMock.mock,
});

describe('methods/token/update', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should correctly update entity', async () => {
    const entity = getRepository(Token).create({
      id: 'id',
      type: TokenType.jwt,
      userId: 'userId',
      personal: null,
      access: 'access',
      refresh: 'refresh',
      params: {},
    });
    const fields = { params: { hello: 'world' } };

    TypeormMock.queryBuilder.getMany.returns([entity]);
    TypeormMock.entityManager.save.resolves(fields);

    const res = await Update({ fields, query: { where: { id: entity.id } } }, endpointOptions);

    expect(res).to.deep.equal(updateResult(fields));
  });
});
