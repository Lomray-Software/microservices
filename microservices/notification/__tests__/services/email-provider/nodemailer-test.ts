import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import { Transporter } from 'nodemailer';
import sinon from 'sinon';
import EmailProvider from '@constants/email-provider';
import Message from '@entities/message';
import Nodemailer from '@services/email-provider/nodemailer';

describe('services/email-provider/nodemailer', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getRepository(Message);

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create simple email provider', async () => {
    const messageId = 'email-message-id';
    const defaultEmailFrom = 'default@email.com';
    const params = {
      from: 'from@email.com',
      to: ['to@email.com', 'another@email.com'],
      replyTo: undefined,
      subject: 'Subject',
      text: 'Text',
      html: '<strong>Html</strong>',
    };
    const sendMail = sandbox.stub().resolves({ messageId });
    const service = new Nodemailer(
      EmailProvider.SIMPLE,
      { sendMail } as unknown as Transporter,
      repository,
      {
        defaultEmailFrom,
      },
    );

    const isSent = await service.send(params);

    const [, message] = TypeormMock.entityManager.save.firstCall.args;

    expect(isSent).to.ok;
    expect(sendMail).to.calledOnceWith(params);
    expect(message).to.deep.equal({
      from: 'from@email.com',
      params: {
        messageId: 'email-message-id',
      },
      subject: 'Subject',
      text: 'Text',
      to: 'to@email.com, another@email.com',
      type: 'email',
    });
  });
});
