import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { noticeMock } from '@__mocks__/notice';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import NoticeAll from '@services/task-handlers/notice-all';

describe('services/task-handlers/notice-all', () => {
  const sandbox = sinon.createSandbox();
  let apiGet: sinon.SinonStub;
  let noticeAll: NoticeAll;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    noticeAll = new NoticeAll(TypeormMock.entityManager);
    apiGet = sinon.stub(Api, 'get');
  });

  afterEach(() => {
    sandbox.restore();
    apiGet.restore();
  });

  describe('take', () => {
    it('should correctly return false: task type is not notice all', () => {
      expect(noticeAll.take([{ ...taskMock, type: TaskType.EMAIL_ALL }])).to.false;
    });

    it('should correctly return true: task type is notice all', () => {
      expect(noticeAll.take([taskMock])).to.true;
    });
  });

  describe('processTasks', () => {
    const taskWithNotices = {
      ...taskMock,
      notices: [{ ...noticeMock, params: { ...noticeMock.params, isTemplate: true } }],
    };

    it('should correctly process tasks', async () => {
      const sendNoticeToAllUsersStub = sandbox.stub();

      await noticeAll['processTasks'].call(
        {
          manager: TypeormMock.entityManager,
          sendNoticeToAllUsers: sendNoticeToAllUsersStub,
        },
        taskWithNotices,
      );

      expect(TypeormMock.entityManager.getRepository).to.be.called;
      expect(sendNoticeToAllUsersStub).to.be.calledOnce;
      expect(sendNoticeToAllUsersStub).to.be.calledWith(taskWithNotices);
    });

    it('should throw error: task notice template was not found', async () => {
      expect(
        await waitResult(
          noticeAll['processTasks'].call({ manager: TypeormMock.entityManager }, taskMock),
        ),
      ).to.throw('Task notice template was not found.');
    });
  });

  describe('sendNoticeToAllUsers', () => {
    it('should correctly send notice to all users', async () => {
      const getTotalUsersCountStub = sandbox.stub();
      const executeNoticeAllTaskStub = sandbox.stub();

      await noticeAll['sendNoticeToAllUsers'].call(
        {
          getTotalUsersCount: getTotalUsersCountStub,
          executeNoticeAllTask: executeNoticeAllTaskStub,
          currentPage: 1,
        },
        taskMock,
      );

      expect(getTotalUsersCountStub).to.calledOnce;
      expect(getTotalUsersCountStub.args[0][0]).to.equal(undefined);
      expect(executeNoticeAllTaskStub).to.calledOnce;
    });

    it('should throw error: failed to send notice to all users', async () => {
      const getTotalUsersCountStub = sandbox.stub().throws(new Error('Failed to get users count'));

      expect(
        await waitResult(
          noticeAll['sendNoticeToAllUsers'].call(
            { getTotalUsersCount: getTotalUsersCountStub },
            taskMock,
          ),
        ),
      ).to.throw('Failed to get users count');
    });
  });
});
