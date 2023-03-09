import wait from '@lomray/client-helpers/helpers/wait';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  subscriptionEventInsert,
  subscriptionEventUpdate,
} from '@lomray/microservice-helpers/test-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/notifications';
import { expect } from 'chai';
import sinon from 'sinon';
import Notice from '@entities/notice';
import NoticeSubscriber from '@subscribers/notice';

describe('subscribers/notice', () => {
  const sandbox = sinon.createSandbox();
  const noticeSubscriber = new NoticeSubscriber();
  const noticeRepository = TypeormMock.entityManager.getRepository(Notice);

  const mockNotify = noticeRepository.create({
    type: 'type',
    userId: 'userId',
    title: 'title',
    description: 'description',
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be subscribed to notice entity', () => {
    const target = noticeSubscriber.listenTo();

    expect(target).to.equal(Notice);
  });

  it('should send event after create', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    await noticeSubscriber.afterInsert({
      ...subscriptionEventInsert(),
      entity: mockNotify,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.NotifyCreate);
    expect(params).to.deep.equal({ entity: mockNotify });
  });

  it('should send event after update', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    await noticeSubscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      databaseEntity: mockNotify,
      entity: mockNotify,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.NotifyUpdate);
    expect(params).to.deep.equal({ entity: mockNotify });
  });
});
