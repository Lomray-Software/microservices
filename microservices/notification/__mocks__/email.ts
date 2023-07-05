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

export { messageIdMock, defaultEmailFromMock, paramsMock };
