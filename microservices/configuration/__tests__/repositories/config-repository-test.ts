import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getCustomRepository } from 'typeorm';
import Config from '@entities/config';
import OriginalConfigRepository from '@repositories/config-repository';

const { default: ConfigRepository } = rewiremock.proxy<{
  default: typeof OriginalConfigRepository;
}>(() => require('@repositories/config-repository'), {
  typeorm: TypeormMock.mock,
});

describe('repositories/config-repository', () => {
  const instance = getCustomRepository(ConfigRepository);
  const sampleConfigs: Partial<Config>[] = Array(20).fill({
    microservice: 'demo',
    type: 'db',
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
