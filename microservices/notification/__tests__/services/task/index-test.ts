import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { noticeMock } from '@__mocks__/notice';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import Notice from '@entities/notice';
import TaskEntity from '@entities/task';
import Task from '@services/task';

describe('services/email-provider/factory', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('handleAfterInsert', () => {
    it('should create and attach recipients', async () => {
      const handleAttachStub = sandbox.stub();

      await Task.handleAfterInsert.call(
        { handleAttach: handleAttachStub },
        {} as TaskEntity,
        TypeormMock.entityManager,
      );

      expect(handleAttachStub).to.calledOnce;
    });
  });

  describe('handleAttach', () => {
    it('should throw an error if task type is not expected', async () => {
      expect(
        await waitResult(
          // @ts-ignore
          Task['handleAttach']({ ...taskMock, type: 'unknown' }, TypeormMock.entityManager),
        ),
      ).to.throw('Unexpected task type.');
    });

    it('should correctly handle notice all type', async () => {
      const createAndAttachNoticeTemplateStub = sandbox.stub();

      await Task['handleAttach'].call(
        { createAndAttachNoticeTemplate: createAndAttachNoticeTemplateStub },
        {
          ...taskMock,
          type: TaskType.NOTICE_ALL,
          notices: [{ ...noticeMock, params: { isTemplate: true } } as Notice],
        },
        TypeormMock.entityManager,
      );

      expect(createAndAttachNoticeTemplateStub).to.calledOnce;
    });
  });
});
