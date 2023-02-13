import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import { getCustomRepository } from 'typeorm';
import Task from '@entities/task';
import OriginalRepositoryTask from '@repositories/task';

const { default: ConfigRepository } = rewiremock.proxy<{
  default: typeof OriginalRepositoryTask;
}>(() => require('@repositories/task'), {
  typeorm: TypeormMock.mock,
});

describe('repositories/task', () => {
  const instance = getCustomRepository(ConfigRepository);
  const sampleTasks: Partial<Task>[] = Array<Partial<Task>>(20).fill({
    rule: '* * * * *',
    method: 'demo',
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should correctly split by chunks and create tasks', async () => {
    await instance.bulkSave(sampleTasks, 2);

    const [, entities, task] = TypeormMock.entityManager.save.firstCall.args;

    expect(entities).to.length(sampleTasks.length);
    expect(task.chunk).to.equal(2);
  });

  it('should correctly split by chunks and create task: default chunk size', async () => {
    await instance.bulkSave(sampleTasks);

    const [, entities, task] = TypeormMock.entityManager.save.firstCall.args;

    expect(entities).to.length(sampleTasks.length);
    expect(task.chunk).to.equal(10);
  });
});
