import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { noticeMock } from '@__mocks__/notice';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import NoticeAll from '@services/task-handlers/notice-all';

describe('services/task-handlers/abstract', () => {
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
      const handleProcessTaskExecutionStub = sandbox.stub();

      await noticeAll['processTasks'].call(
        {
          manager: TypeormMock.entityManager,
          handleProcessTaskExecution: handleProcessTaskExecutionStub,
        },
        taskWithNotices,
      );

      expect(TypeormMock.entityManager.getRepository).to.be.called;
      expect(handleProcessTaskExecutionStub).to.be.calledOnce;
      expect(handleProcessTaskExecutionStub).to.be.calledWith(taskWithNotices);
    });

    it('should throw error: task notice template was not found', async () => {
      expect(
        await waitResult(
          noticeAll['processTasks'].call({ manager: TypeormMock.entityManager }, taskMock),
        ),
      ).to.throw('Task notice template was not found.');
    });
  });
});
