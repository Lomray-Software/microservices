import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import Factory from '@services/task-handlers/factory';
import NoticeAll from '@services/task-handlers/notice-all';

describe('services/task-handlers/factory', () => {
  const sandbox = sinon.createSandbox();
  const noticeAllTakeSpy = sandbox.spy(NoticeAll.prototype, 'take');
  // const emailAllTakeSpy = sandbox.spy(EmailAll.prototype, 'take');

  afterEach(() => {
    sandbox.restore();
  });

  describe('init', () => {
    it('should correctly init matched notice all service', () => {
      const matchedServices = Factory.init([taskMock], TypeormMock.entityManager);

      expect(matchedServices.length).to.equal(1);
    });

    it('should correctly init matched notice and email all service', () => {
      const matchedServices = Factory.init(
        [taskMock, { ...taskMock, type: TaskType.EMAIL_ALL }],
        TypeormMock.entityManager,
      );

      expect(matchedServices.length).to.equal(2);
    });
  });

  describe('process', () => {
    it('should correctly process notice all service', async () => {
      const process = sandbox.stub(Promise, 'all').resolves([
        {
          total: 1,
          completed: 1,
          failed: 0,
        },
        {
          total: 2,
          completed: 1,
          failed: 1,
        },
      ]);

      const result = await Factory.process([taskMock]);

      expect(result).to.deep.equal({ total: 3, completed: 2, failed: 1 });
      expect(noticeAllTakeSpy).to.calledOnce;
      expect(process).to.calledOnce;
    });

    it('should correctly process email all service', async () => {
      const process = sandbox.stub(Promise, 'all').resolves([
        {
          total: 1,
          completed: 1,
          failed: 0,
        },
        {
          total: 2,
          completed: 1,
          failed: 1,
        },
      ]);

      const result = await Factory.process([{ ...taskMock, type: TaskType.EMAIL_ALL }]);

      expect(result).to.deep.equal({ total: 3, completed: 2, failed: 1 });
      // @TODO: check it correctly return and process email service but spy not called
      // expect(emailAllTakeSpy).to.calledOnce;
      expect(process).to.calledOnce;
    });
  });
});
