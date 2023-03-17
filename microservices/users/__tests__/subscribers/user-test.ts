import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import {
  subscriptionEventInsert,
  subscriptionEventUpdate,
} from '@lomray/microservice-helpers/test-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import UsersEvents from '@lomray/microservices-client-api/constants/events/users';
import { expect } from 'chai';
import sinon from 'sinon';
import User from '@entities/user';
import UserSubscriber from '@subscribers/user';

describe('subscribers/user', () => {
  const sandbox = sinon.createSandbox();
  const subscriber = new UserSubscriber();
  const repository = TypeormMock.entityManager.getRepository(User);

  const mockUser = repository.create({ id: 'user-id', firstName: 'Mike' });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be subscribed to user entity', () => {
    const target = subscriber.listenTo();

    expect(target).to.equal(User);
  });

  it('should create profile & username after create new user', async () => {
    await subscriber.afterInsert({
      ...subscriptionEventInsert(),
      entity: mockUser,
    });

    const [, profile] = TypeormMock.entityManager.save.firstCall.args;
    const [, userCriteria, userFields] = TypeormMock.entityManager.update.firstCall.args;

    expect(profile).to.deep.equal({ userId: mockUser.id });
    expect(userFields.username).to.equal(mockUser.id.replace('-', ''));
    expect(userCriteria.id).to.equal(mockUser.id);
  });

  it('should remove relations with user & trigger event', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    await subscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      entity: { ...mockUser, deletedAt: 'string' },
      databaseEntity: { ...mockUser, deletedAt: null },
    });

    const [, criteria] = TypeormMock.entityManager.softDelete.firstCall.args;
    const [eventName, params] = publishStub.firstCall.args;

    expect(criteria).to.deep.equal({ userId: mockUser.id });
    expect(TypeormMock.entityManager.softDelete).to.calledTwice; // profile, providers
    expect(eventName).to.equal(UsersEvents.UserRemove);
    expect(params).to.deep.equal({ entity: { ...mockUser, deletedAt: 'string' } });
  });

  it('should recover relations with user & trigger event', async () => {
    const publishStub = sandbox.stub(Microservice, 'eventPublish');

    await subscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      entity: { ...mockUser, deletedAt: null },
      databaseEntity: { ...mockUser, deletedAt: new Date() },
    });

    const [, criteria] = TypeormMock.entityManager.restore.firstCall.args;
    const [eventName, params] = publishStub.firstCall.args;

    expect(criteria).to.deep.equal({ userId: mockUser.id });
    expect(TypeormMock.entityManager.restore).to.calledTwice; // profile, providers
    expect(eventName).to.equal(UsersEvents.UserRestore);
    expect(params).to.deep.equal({ entity: { ...mockUser, deletedAt: null } });
  });

  it('should normal update user without any actions with profile', async () => {
    await subscriber.afterUpdate({
      ...subscriptionEventUpdate(),
      entity: { ...mockUser, deletedAt: new Date() },
      databaseEntity: { ...mockUser, deletedAt: new Date() },
    });

    expect(TypeormMock.entityManager.restore).to.not.called;
    expect(TypeormMock.entityManager.softDelete).to.not.called;
  });
});
