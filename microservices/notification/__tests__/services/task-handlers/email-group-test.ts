import { Api } from '@lomray/microservice-helpers';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { taskMock } from '@__mocks__/task';
import TaskType from '@constants/task-type';
import Message from '@entities/message';
import Recipient from '@entities/recipient';
import type AbstractEmailProvider from '@services/email-provider/abstract';
import EmailGroup from '@services/task-handlers/email-group';

describe('services/task-handlers/email-group', () => {
  const sandbox = sinon.createSandbox();
  let apiGet: sinon.SinonStub;
  let emailGroup: EmailGroup;
  const messageRepository = TypeormMock.entityManager.getRepository(Message);
  const recipientRepository = TypeormMock.entityManager.getRepository(Recipient);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
    emailGroup = new EmailGroup(TypeormMock.entityManager);
    apiGet = sinon.stub(Api, 'get');
  });

  afterEach(() => {
    sandbox.restore();
    apiGet.restore();
  });

  describe('take', () => {
    it('should correctly return false: task type is not email group', () => {
      expect(emailGroup.take([taskMock])).to.false;
    });

    it('should correctly return true: task type is email group', () => {
      expect(emailGroup.take([{ ...taskMock, type: TaskType.EMAIL_GROUP }])).to.true;
    });
  });

  describe('sendEmailToRecipients', () => {
    it('should correctly send email to recipients', async () => {
      const executeTaskStub = sandbox.stub();

      await emailGroup['sendEmailToRecipients'].call(
        {
          messageTemplate: { taskId: 'id' },
          messageRepository,
          recipientRepository,
          executeTask: executeTaskStub,
        },
        taskMock,
      );

      expect(executeTaskStub).to.calledOnce;
    });
  });

  describe('processTasks', () => {
    it('should correctly exit process: task template was not found', async () => {
      const sendEmailToRecipientsStub = sandbox.stub();

      expect(
        await waitResult(
          emailGroup['processTasks'].call(
            {
              messageTemplate: { taskId: 'id' },
              manager: TypeormMock.entityManager,
              endEmailToRecipients: sendEmailToRecipientsStub,
            },
            taskMock,
          ),
        ),
      ).to.throw('Task message template was not found.');
    });

    it('should correctly process tasks', async () => {
      const sendEmailToRecipientsStub = sandbox.stub();
      const checkIsMessageTemplateValidStub = sandbox.stub().resolves(true);

      await emailGroup['processTasks'].call(
        {
          messageTemplate: { taskId: 'id' },
          manager: TypeormMock.entityManager,
          sendEmailToRecipients: sendEmailToRecipientsStub,
          checkIsMessageTemplateValid: checkIsMessageTemplateValidStub,
        },
        { ...taskMock, messages: [{ params: { isTemplate: true } }] },
      );

      expect(sendEmailToRecipientsStub).to.calledOnce;
      expect(checkIsMessageTemplateValidStub).to.calledOnce;
    });
  });

  describe('executeTask', () => {
    it('should throw error: users API error', async () => {
      apiGet.returns({
        users: {
          user: {
            list() {
              return { error: { message: 'Users API error.' } };
            },
          },
        },
      });

      expect(
        await waitResult(
          emailGroup['executeTask']({} as AbstractEmailProvider, [{}] as Recipient[]),
        ),
      ).to.throw('Users API error.');
    });
  });
});
