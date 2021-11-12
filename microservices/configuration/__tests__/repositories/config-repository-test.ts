import TypeormMock from '@lomray/microservice-helpers/mocks/typeorm';
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
  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correct split by chunks and create configs', async () => {
    const instance = getCustomRepository(ConfigRepository);
    const sampleConfigs: Partial<Config>[] = Array(5).fill({
      microservice: 'demo',
      type: 'db',
    });

    await instance.bulkSave(sampleConfigs, 2);

    const [, entities, config] = TypeormMock.entityManager.save.firstCall.args;

    expect(entities).to.length(sampleConfigs.length);
    expect(config.chunk).to.equal(2);
  });
});
