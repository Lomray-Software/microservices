import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  subscriptionEventInsert,
  subscriptionEvent,
  subscriptionEventUpdate,
} from '@lomray/microservice-helpers/test-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import sinon from 'sinon';
import type { RemoveEvent } from 'typeorm';
import Task from '@entities/task';
import TaskRepository from '@repositories/task';
import TaskManager from '@services/task-manager';
import TaskSubscriber from '@subscribers/task';

describe('subscribers/task', () => {
  const sandbox = sinon.createSandbox();
  const ms = Microservice.create();
  const taskSubscriber = new TaskSubscriber();
  const taskRepository = TypeormMock.entityManager.getCustomRepository(TaskRepository);

  const mockTask = taskRepository.create({
    rule: '* * * * *',
    method: 'method',
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be subscribed to the Task entity', () => {
    const target = taskSubscriber.listenTo();

    expect(target).to.equal(Task);
  });

  it('should run new task', async () => {
    const runStub = sandbox.stub(TaskManager.init(ms), 'runTasks');

    await taskSubscriber.afterInsert({
      ...subscriptionEventInsert(),
      entity: mockTask,
    });

    expect(runStub).to.calledOnceWith([mockTask]);
  });

  it('should stop task', async () => {
    const stopStub = sandbox.stub(TaskManager.init(ms), 'stopTask');

    await taskSubscriber.afterRemove({
      ...subscriptionEvent(),
      databaseEntity: mockTask,
    } as RemoveEvent<Task>);

    expect(stopStub).to.calledOnceWith(mockTask.id);
  });

  it('should reschedule task', async () => {
    const rescheduleStub = sandbox.stub(TaskManager.init(ms), 'rescheduleTask');

    await taskSubscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      databaseEntity: mockTask,
    });

    expect(rescheduleStub).to.calledOnceWith(mockTask);
  });
});
