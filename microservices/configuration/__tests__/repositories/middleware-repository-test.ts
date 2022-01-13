import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { MiddlewareType } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getCustomRepository } from 'typeorm';
import Middleware from '@entities/middleware';
import OriginalMiddlewareRepository from '@repositories/config-repository';

const { default: MiddlewareRepository } = rewiremock.proxy<{
  default: typeof OriginalMiddlewareRepository;
}>(() => require('@repositories/middleware-repository'), {
  typeorm: TypeormMock.mock,
});

describe('repositories/middleware-repository', () => {
  const instance = getCustomRepository(MiddlewareRepository);
  const sampleConfigs: Partial<Middleware>[] = Array<Partial<Middleware>>(20).fill({
    target: 'demo',
    targetMethod: 'test',
    senderMethod: 'method',
    sender: 'sender',
    type: MiddlewareType.response,
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly split by chunks and create configs', async () => {
    await instance.bulkSave(sampleConfigs, 2);

    const [, entities, config] = TypeormMock.entityManager.save.firstCall.args;

    expect(entities).to.length(sampleConfigs.length);
    expect(config.chunk).to.equal(2);
  });

  it('should correctly split by chunks and create configs: default chunk size', async () => {
    await instance.bulkSave(sampleConfigs);

    const [, entities, config] = TypeormMock.entityManager.save.firstCall.args;

    expect(entities).to.length(sampleConfigs.length);
    expect(config.chunk).to.equal(10);
  });
});
