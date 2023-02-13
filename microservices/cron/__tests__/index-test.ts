import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { expect } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import TaskManager from '@services/task-manager';

describe('microservice: start', () => {
  const sandbox = sinon.createSandbox();
  const run = sandbox.stub();
  const ms = Microservice.create();

  rewiremock.proxy(() => require('../src'), {
    '@lomray/microservice-helpers': rewiremock('@lomray/microservice-helpers')
      .callThrough()
      .with({ run }),
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should correctly start microservice', () => {
    const args = run.firstCall.firstArg;

    expect(run).to.calledOnce;
    expect(args).to.have.property('msOptions');
    expect(args).to.have.property('msParams');
    expect(args).to.have.property('registerMethods');
  });

  it('should correctly create init tasks', async () => {
    const {
      hooks: { afterCreateMicroservice },
    } = run.firstCall.firstArg;
    const bulkSaveStub = sandbox.stub();
    const countStub = sandbox.stub();

    sandbox.stub(TaskManager.init(ms), 'assignNodeId');
    sandbox.stub(TaskManager.init(ms), 'runTasks');

    TypeormMock.entityManager.getCustomRepository.callsFake(() => ({
      bulkSave: bulkSaveStub,
      count: countStub,
    }));

    await afterCreateMicroservice();

    expect(bulkSaveStub).calledOnce;
  });

  it('should prevent create init tasks: already exist', async () => {
    const {
      hooks: { afterCreateMicroservice },
    } = run.firstCall.firstArg;
    const bulkSaveStub = sandbox.stub();
    const countStub = sandbox.stub().resolves(1);

    sandbox.stub(TaskManager.init(ms), 'assignNodeId');
    sandbox.stub(TaskManager.init(ms), 'runTasks');

    TypeormMock.entityManager.getCustomRepository.callsFake(() => ({
      bulkSave: bulkSaveStub,
      count: countStub,
    }));

    await afterCreateMicroservice();

    expect(bulkSaveStub).not.called;
  });

  it('should correctly run tasks', async () => {
    const {
      hooks: { afterCreateMicroservice },
    } = run.firstCall.firstArg;
    const assignNodeIdStub = sandbox.stub(TaskManager.init(ms), 'assignNodeId');
    const runStub = sandbox.stub(TaskManager.init(ms), 'run');

    await afterCreateMicroservice();

    expect(assignNodeIdStub).to.calledOnce;
    expect(runStub).to.calledOnce;
  });
});
