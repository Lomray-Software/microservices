import wait from '@lomray/client-helpers/helpers/wait';
import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  subscriptionEventInsert,
  subscriptionEventUpdate,
} from '@lomray/microservice-helpers/test-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/files';
import { expect } from 'chai';
import sinon from 'sinon';
import File from '@entities/file';
import FileSubscriber from '@subscribers/file';

describe('subscribers/file', () => {
  const sandbox = sinon.createSandbox();
  const subscriber = new FileSubscriber();
  const repository = TypeormMock.entityManager.getRepository(File);

  const mockEntity = repository.create({ id: 'id' });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be subscribed to file entity', () => {
    const target = subscriber.listenTo();

    expect(target).to.equal(File);
  });

  it('should send event after create', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterInsert({
      ...subscriptionEventInsert(),
      entity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileCreate);
    expect(params).to.deep.equal({ entity: mockEntity });
  });

  it('should send event after update', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      databaseEntity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileUpdate);
    expect(params).to.deep.equal({ entity: mockEntity });
  });

  it('should send event after remove', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterRemove({
      ...subscriptionEventUpdate(),
      databaseEntity: mockEntity,
      entity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileRemove);
    expect(params).to.deep.equal({ entity: mockEntity });
  });

  it('should attach related entities before remove', async () => {
    const relations = [{ relation: 1 }];

    TypeormMock.entityManager.find.resolves(relations);

    await subscriber.beforeRemove({
      ...subscriptionEventUpdate(),
      entity: mockEntity,
    });

    expect(mockEntity.fileEntities).to.deep.equal(relations);
  });
});
