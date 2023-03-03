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
import FileEntity from '@entities/file-entity';
import FileEntitySubscriber from '@subscribers/file-entity';

describe('subscribers/file-entity', () => {
  const sandbox = sinon.createSandbox();
  const subscriber = new FileEntitySubscriber();
  const repository = TypeormMock.entityManager.getRepository(FileEntity);

  const mockEntity = repository.create({ id: 'id', entityId: 'entityId' });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be subscribed to file entity', () => {
    const target = subscriber.listenTo();

    expect(target).to.equal(FileEntity);
  });

  it('should set default order before create', async () => {
    await subscriber.beforeInsert({
      ...subscriptionEventInsert(),
      entity: mockEntity,
    });

    expect(mockEntity.order).to.equal(999999999);
  });

  it('should refresh order and send event after create', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterInsert({
      ...subscriptionEventInsert(),
      entity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileEntityCreate);
    expect(params).to.deep.equal({ entity: mockEntity });
    expect(TypeormMock.entityManager.query.firstCall.lastArg).to.deep.equal([mockEntity.entityId]);
  });

  it('should send event after update', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      databaseEntity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileEntityUpdate);
    expect(params).to.deep.equal({ entity: mockEntity });
  });

  it('should refresh order and send event after remove', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    subscriber.afterRemove({
      ...subscriptionEventUpdate(),
      databaseEntity: mockEntity,
      entity: mockEntity,
    });

    await wait(1);

    const [eventName, params] = publishStub.firstCall.args;

    expect(eventName).to.equal(Event.FileEntityRemove);
    expect(params).to.deep.equal({ entity: mockEntity });
    expect(TypeormMock.entityManager.query.firstCall.lastArg).to.deep.equal([mockEntity.entityId]);
  });
});
