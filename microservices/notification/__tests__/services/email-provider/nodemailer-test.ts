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

  /**
   * Mocks
   */
  const messageIdMock = 'email-message-id';
  const defaultEmailFromMock = 'default@email.com';
  const paramsMock = {
    from: 'from@email.com',
    to: ['to@email.com', 'another@email.com'],
    replyTo: undefined,
    subject: 'Subject',
    text: 'Text',
    html: '<strong>Html</strong>',
  };

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should successful create simple email provider', async () => {
    const sendMail = sandbox.stub().resolves({ messageId: messageIdMock });
    const service = new Nodemailer(
      EmailProvider.SIMPLE,
      { sendMail } as unknown as Transporter,
      repository,
      {
        defaultEmailFrom: defaultEmailFromMock,
      },
    );

    const isSent = await service.send(paramsMock);

    const [, message] = TypeormMock.entityManager.save.firstCall.args;

    expect(TypeormMock.entityManager.save).to.calledOnce;
    expect(TypeormMock.entityManager.create).to.calledOnce;
    expect(isSent).to.ok;
    expect(sendMail).to.calledOnceWith(paramsMock);
    expect(message).to.deep.equal({
      from: paramsMock.from,
      params: {
        messageId: messageIdMock,
      },
      subject: 'Subject',
      text: 'Text',
      to: 'to@email.com, another@email.com',
      type: 'email',
    });
  });

  it('should successful send message with the attachment', async () => {
    const sendMail = sandbox.stub().resolves({ messageId: messageIdMock });
    const service = new Nodemailer(
      EmailProvider.SIMPLE,
      { sendMail } as unknown as Transporter,
      repository,
      {
        defaultEmailFrom: defaultEmailFromMock,
      },
    );

    const attachments = [
      {
        encoding: 'base64',
        content: Buffer.from('PDF').toString('base64'),
        filename: 'mock.pdf',
      },
    ];

    const isSent = await service.send({ ...paramsMock, attachments });

    const [, message] = TypeormMock.entityManager.save.firstCall.args;

    expect(TypeormMock.entityManager.save).to.calledOnce;
    expect(TypeormMock.entityManager.create).to.calledOnce;
    expect(isSent).to.ok;
    expect(sendMail).to.calledOnceWith({ ...paramsMock, attachments });
    expect(message).to.deep.equal({
      from: paramsMock.from,
      params: {
        messageId: messageIdMock,
      },
      subject: 'Subject',
      text: 'Text',
      to: 'to@email.com, another@email.com',
      type: 'email',
      attachments,
    });
  });
});
