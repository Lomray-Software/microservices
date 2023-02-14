import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice, MicroserviceResponse, BaseException } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import schedule from 'node-schedule';
import sinon from 'sinon';
import TaskStatus from '@constants/task-status';
import TaskRepository from '@repositories/task';
import TaskManager from '@services/task-manager';

describe('services/task-manager', () => {
  const sandbox = sinon.createSandbox();
  const taskRepository = TypeormMock.entityManager.getCustomRepository(TaskRepository);
  const ms = Microservice.create();
  const task = taskRepository.create({
    id: 1,
    nodeId: 'node1',
    method: 'method',
    rule: '1 * * * *',
    payload: {
      params: {
        world: "<%= 'hello' %>",
      },
    },
  });
  const tasks = [task];

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should throw error if service doesn't initialized", () => {
    sandbox.stub(TaskManager, 'instance' as never).value(null);

    expect(() => TaskManager.get()).to.throw();
  });

  it('should correctly init service', () => {
    expect(TaskManager.init(ms)).to.equal(TaskManager.get());
  });

  it('should correctly skip task run: node id not assigned', () => {
    const scheduleStub = sandbox.stub(schedule, 'scheduleJob');

    TaskManager.get().runTasks(tasks);

    expect(scheduleStub).to.not.called;
  });

  it('should correctly assign node id', async () => {
    const getWorkersStub = sandbox.stub(ms, 'getWorkers').resolves(['1', '2']);

    expect(TaskManager.get()).to.not.property('nodeId');

    await TaskManager.get().assignNodeId();

    expect(getWorkersStub).to.calledOnce;
    expect(TaskManager.get()).to.property('nodeId').to.equal('node1');
  });

  it('should correctly run tasks from db', async () => {
    const runStub = sandbox.stub(TaskManager.get(), 'runTasks');

    TypeormMock.entityManager.find.resolves(tasks);

    await TaskManager.get().run();

    expect(runStub).to.calledOnceWith(tasks);
  });

  it('should prevent run tasks from db: empty tasks', async () => {
    const runStub = sandbox.stub(TaskManager.get(), 'runTasks');

    TypeormMock.entityManager.find.resolves([]);

    await TaskManager.get().run();

    expect(runStub).to.not.called;
  });

  it('should correctly stop task', () => {
    const cancelStub = sandbox.stub(schedule, 'cancelJob');
    const jobMock = { task: true };

    sandbox.stub(schedule, 'scheduledJobs').value({ [`task-${task.id}`]: jobMock });

    TaskManager.get().stopTask(task.id);

    expect(cancelStub).to.calledOnceWith(jobMock);
  });

  it('should correctly skip stop task: task not running', () => {
    const cancelStub = sandbox.stub(schedule, 'cancelJob');

    sandbox.stub(schedule, 'scheduledJobs').value({});

    TaskManager.get().stopTask(task.id);

    expect(cancelStub).to.not.called;
  });

  it('should correctly reschedule task', () => {
    const stopStub = sandbox.stub(TaskManager.get(), 'stopTask');
    const runStub = sandbox.stub(TaskManager.get(), 'runTasks');

    TaskManager.get().rescheduleTask(task);

    expect(stopStub).to.calledOnceWith(task.id);
    expect(runStub).to.calledOnceWith([task]);
  });

  it('should skip reschedule task: another node id', () => {
    const stopStub = sandbox.stub(TaskManager.get(), 'stopTask');
    const runStub = sandbox.stub(TaskManager.get(), 'runTasks');

    TaskManager.get().rescheduleTask({
      ...task,
      nodeId: 'another',
    });

    expect(stopStub).to.calledOnceWith(task.id);
    expect(runStub).to.not.called;
  });

  it('should correctly schedule tasks', () => {
    const scheduleStub = sandbox.stub(schedule, 'scheduleJob');

    TaskManager.get().runTasks(tasks);

    const [taskName, rule] = scheduleStub.firstCall.args;

    expect(taskName).to.equal(['task', task.id].join('-'));
    expect(rule).to.equal(task.rule);
  });

  it('should correctly execute task: success response', async () => {
    const responseMock = { task: 'result' };

    const scheduleStub = sandbox.stub(schedule, 'scheduleJob');
    const sendStub = sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        result: responseMock,
      }),
    );

    TaskManager.get().runTasks(tasks);

    const callback = scheduleStub.firstCall.lastArg;

    await callback();

    const [, { response, status, taskId }] = TypeormMock.entityManager.save.lastCall.args;
    const [, params] = sendStub.firstCall.args;

    expect(TypeormMock.entityManager.save).to.calledTwice;
    expect(sendStub).to.calledOnce;
    expect(params).to.deep.equal({
      world: 'hello',
    });
    expect(response).to.deep.equal(responseMock);
    expect(status).to.equal(TaskStatus.success);
    expect(taskId).to.equal(task.id);
  });

  it('should correctly execute task: error response', async () => {
    const scheduleStub = sandbox.stub(schedule, 'scheduleJob');
    const sendStub = sandbox.stub(ms, 'sendRequest').resolves(
      new MicroserviceResponse({
        error: new BaseException({ message: 'Job error' }),
      }),
    );

    TaskManager.get().runTasks(tasks);

    const callback = scheduleStub.firstCall.lastArg;

    await callback();

    const [, { response, status, taskId }] = TypeormMock.entityManager.save.lastCall.args;

    expect(TypeormMock.entityManager.save).to.calledTwice;
    expect(sendStub).to.calledOnce;
    expect(response).to.deep.equal({
      code: 0,
      message: 'Job error',
      service: 'unknown',
      status: 0,
    });
    expect(status).to.equal(TaskStatus.error);
    expect(taskId).to.equal(task.id);
  });
});
