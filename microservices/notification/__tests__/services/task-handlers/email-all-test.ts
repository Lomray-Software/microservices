import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import EmailAll from '@services/task-handlers/email-all';

describe('services/task-handlers/email-all', () => {
  const sandbox = sinon.createSandbox();
  let apiGet: sinon.SinonStub;
  let emailAll: EmailAll;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    emailAll = new EmailAll(TypeormMock.entityManager);
    apiGet = sinon.stub(Api, 'get');
  });

  afterEach(() => {
    sandbox.restore();
    apiGet.restore();
  });

  describe('take', () => {
    it('should correctly return false: task type is not email all', () => {
      expect(emailAll.take([taskMock])).to.false;
    });

    it('should correctly return true: task type is email all', () => {
      expect(emailAll.take([{ ...taskMock, type: TaskType.EMAIL_ALL }])).to.true;
    });
  });

  describe('sendEmailToAllUsers', () => {
    it('should correctly send email to all users', async () => {
      const getTotalUsersCountStub = sandbox.stub();
      const executeEmailAllTaskStub = sandbox.stub();

      await emailAll['sendEmailToAllUsers'].call(
        {
          getTotalUsersCount: getTotalUsersCountStub,
          executeEmailAllTask: executeEmailAllTaskStub,
          currentPage: 1,
        },
        taskMock,
      );

      expect(getTotalUsersCountStub).to.calledOnce;
      expect(getTotalUsersCountStub.args[0][0]).to.equal(true);
      expect(executeEmailAllTaskStub).to.calledOnce;
    });

    it('should throw error: failed to send email to all users', async () => {
      const getTotalUsersCountStub = sandbox.stub().throws(new Error('Failed to get users count'));

      expect(
        await waitResult(
          emailAll['sendEmailToAllUsers'].call(
            { getTotalUsersCount: getTotalUsersCountStub },
            taskMock,
          ),
        ),
      ).to.throw('Failed to get users count');
    });
  });
});
