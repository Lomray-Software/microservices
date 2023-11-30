import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { taskMock, handledCountsMock } from '@__mocks__/task';
import TaskStatus from '@constants/task-status';
import TaskType from '@constants/task-type';
import NoticeAll from '@services/task-handlers/notice-all';

/**
 * Test abstract class via NoticeAll service instance
 */
describe('services/task-handlers/abstract', () => {
  const sandbox = sinon.createSandbox();
  const taskNotFoundErrorMessageMock = 'Task not found.';
  let apiGet: sinon.SinonStub;
  let abstractNoticeAll: NoticeAll;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    abstractNoticeAll = new NoticeAll(TypeormMock.entityManager);
    apiGet = sinon.stub(Api, 'get');
  });

  afterEach(() => {
    sandbox.restore();
    apiGet.restore();
  });

  describe('take', () => {
    it('should take 1 notice all task', () => {
      expect(abstractNoticeAll.take([taskMock])).to.be.true;
    });

    it('should take 0 notice all task', () => {
      expect(abstractNoticeAll.take([{ ...taskMock, type: TaskType.EMAIL_ALL }])).to.be.false;
    });
  });

  describe('getTotalUsersCount', () => {
    it('should correctly call and get users', async () => {
      apiGet.returns({
        users: {
          user: {
            count() {
              return { result: { count: 1 } };
            },
          },
        },
      });

      const result = await abstractNoticeAll['getTotalUsersCount']();

      expect(result).to.equal(1);
    });
  });

  describe('getLastUpdatedTaskVersion', () => {
    it('should correctly call and get last updated task version', async () => {
      TypeormMock.entityManager.findOne.returns(taskMock);

      const result = await abstractNoticeAll['getLastUpdatedTaskVersion'](
        'task-id',
        TaskStatus.WAITING,
      );

      expect(result).to.deep.equal(taskMock);
    });

    it('should throw error: task was not found', async () => {
      TypeormMock.entityManager.findOne.returns(undefined);

      expect(
        await waitResult(
          abstractNoticeAll['getLastUpdatedTaskVersion']('task-id', TaskStatus.WAITING),
        ),
      ).to.throw('Failed to update task status to "waiting". Task was not found.');
    });
  });

  describe('updateWaitingTask', () => {
    it('should correctly update waiting task', async () => {
      const handledCounts = { ...handledCountsMock };
      const getLastUpdatedTaskVersionStub = sandbox.stub().resolves(taskMock);

      TypeormMock.entityManager.findOne.returns(taskMock);

      await abstractNoticeAll['updateWaitingTask'].call(
        {
          handledCounts,
          getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
          taskRepository: TypeormMock.entityManager,
        },
        'task-id',
      );

      expect(TypeormMock.entityManager.save).to.calledOnce;
      expect(handledCounts.total).to.equal(1);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });

    it('should do not save if waiting task was not found', async () => {
      const handledCounts = { ...handledCountsMock };
      const getLastUpdatedTaskVersionStub = sandbox
        .stub()
        .throws(new Error(taskNotFoundErrorMessageMock));

      TypeormMock.entityManager.findOne.returns(undefined);

      expect(
        await waitResult(
          abstractNoticeAll['updateWaitingTask'].call(
            {
              handledCounts,
              getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
              taskRepository: TypeormMock.entityManager,
            },
            'task-id',
          ),
        ),
      ).to.throw(taskNotFoundErrorMessageMock);
      expect(TypeormMock.entityManager.save).to.not.called;
      expect(handledCounts.total).to.equal(0);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });
  });

  describe('updateFailedTask', () => {
    it('should correctly update failed task', async () => {
      const handledCounts = { ...handledCountsMock };
      const getLastUpdatedTaskVersionStub = sandbox.stub().resolves(taskMock);

      TypeormMock.entityManager.findOne.returns(taskMock);

      await abstractNoticeAll['updateFailedTask'].call(
        {
          handledCounts,
          getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
          taskRepository: TypeormMock.entityManager,
        },
        'task-id',
        'error-message',
      );

      expect(TypeormMock.entityManager.save).to.calledOnce;
      expect(handledCounts.failed).to.equal(1);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });

    it('should do not save if failed task was not found', async () => {
      const handledCounts = { ...handledCountsMock };
      const getLastUpdatedTaskVersionStub = sandbox
        .stub()
        .throws(new Error(taskNotFoundErrorMessageMock));

      TypeormMock.entityManager.findOne.returns(undefined);

      expect(
        await waitResult(
          abstractNoticeAll['updateFailedTask'].call(
            {
              handledCounts,
              getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
              taskRepository: TypeormMock.entityManager,
            },
            'task-id',
            'error-message',
          ),
        ),
      ).to.throw(taskNotFoundErrorMessageMock);
      expect(TypeormMock.entityManager.save).to.not.called;
      expect(handledCounts.failed).to.equal(0);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });
  });

  describe('updateCompletedTask', () => {
    it('should correctly update completed task', async () => {
      const handledCounts = { ...handledCountsMock };
      const getLastUpdatedTaskVersionStub = sandbox.stub().resolves(taskMock);

      TypeormMock.entityManager.findOne.returns(taskMock);

      await abstractNoticeAll['updateCompletedTask'].call(
        {
          handledCounts,
          getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
          taskRepository: TypeormMock.entityManager,
        },
        'task-id',
      );

      expect(TypeormMock.entityManager.save).to.calledOnce;
      expect(handledCounts.completed).to.equal(1);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });

    it('should do not save if completed task was not found', async () => {
      const handledCounts = { ...handledCountsMock };

      const getLastUpdatedTaskVersionStub = sandbox
        .stub()
        .throws(new Error(taskNotFoundErrorMessageMock));

      TypeormMock.entityManager.findOne.returns(undefined);

      expect(
        await waitResult(
          abstractNoticeAll['updateCompletedTask'].call(
            {
              handledCounts,
              getLastUpdatedTaskVersion: getLastUpdatedTaskVersionStub,
              taskRepository: TypeormMock.entityManager,
            },
            'task-id',
          ),
        ),
      ).to.throw(taskNotFoundErrorMessageMock);
      expect(TypeormMock.entityManager.save).to.not.called;
      expect(handledCounts.completed).to.equal(0);
      expect(getLastUpdatedTaskVersionStub).to.calledOnce;
    });
  });

  describe('resetState', () => {
    it('should correctly reset state', () => {
      abstractNoticeAll['lastFailTargetId'] = 'target-id';

      abstractNoticeAll['resetState']();

      expect(abstractNoticeAll['lastFailTargetId']).to.be.null;
    });
  });

  describe('process', () => {
    it('should return if task length is 0', async () => {
      const handledCounts = { ...handledCountsMock };
      const result = await abstractNoticeAll.process.call({ tasks: [], handledCounts });

      expect(result).to.deep.equal({ total: 0, completed: 0, failed: 0 });
    });

    it('process should correctly call and return result', async () => {
      const handledCounts = { ...handledCountsMock };
      const takeStub = sandbox.stub().returns(true);
      const updateWaitingTaskStub = sandbox.stub().resolves();
      const updateCompletedTaskStub = sandbox.stub().resolves();
      const updateFailedTaskStub = sandbox.stub().resolves();
      const resetStateStub = sandbox.stub().resolves();
      const processTasksStub = sandbox
        .stub()
        .resolves({ ...handledCounts, total: 1, completed: 1 });

      await abstractNoticeAll.process.call(
        {
          tasks: [taskMock],
          take: takeStub,
          updateWaitingTask: updateWaitingTaskStub,
          updateCompletedTask: updateCompletedTaskStub,
          updateFailedTask: updateFailedTaskStub,
          resetState: resetStateStub,
          processTasks: processTasksStub,
          handledCounts,
        },
        taskMock,
      );

      expect(takeStub).to.not.called;
      expect(updateWaitingTaskStub).to.calledOnce;
      expect(updateCompletedTaskStub).to.calledOnce;
      expect(updateFailedTaskStub).to.not.called;
      expect(resetStateStub).to.calledOnce;
      expect(processTasksStub).to.calledOnce;
    });
  });
});
