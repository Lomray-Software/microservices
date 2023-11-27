import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import sinon from 'sinon';
import { createBatchNoticeMock } from '@__mocks__/notice';
import NoticeEntity from '@entities/notice';
import Notice from '@services/notice';
import type { ICreateBatchParams } from '@services/notice';

describe('services/notice', () => {
  const sandbox = sinon.createSandbox();
  const service = Notice.init();

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createBatch', () => {
    it('should throw error: is send for all either users must be provided', async () => {
      const params = [
        {
          status: 'warning',
        },
        {
          ...createBatchNoticeMock,
          isSendForAll: true,
        },
      ] as ICreateBatchParams[];

      for (const param of params) {
        // @TODO: wait result do not work
        try {
          await service.createBatch(param);
        } catch (e) {
          expect(e?.message).to.equal(
            'Expected either users, either for all option to be provided.',
          );
        }
      }
    });

    it('should correctly call send for all', async () => {
      const sendUsersGroupStub = sandbox.stub();
      const sendForAllStub = sandbox.stub();

      const result = await service.createBatch.call(
        {
          sendUsersGroup: sendUsersGroupStub.resolves(),
          sendForAll: sendForAllStub.resolves(100),
          manager: TypeormMock.entityManager,
        },
        {
          ...createBatchNoticeMock,
          userIds: undefined,
          isForAll: true,
        },
      );

      expect(sendUsersGroupStub).to.not.called;
      expect(sendForAllStub).to.calledOnce;
      expect(result).to.equal(100);
    });

    it('should correctly call users group', async () => {
      const sendUsersGroupStub = sandbox.stub();
      const sendForAllStub = sandbox.stub();

      const result = await service.createBatch.call(
        {
          sendUsersGroup: sendUsersGroupStub.resolves(11),
          sendForAll: sendForAllStub,
          manager: TypeormMock.entityManager,
        },
        createBatchNoticeMock,
      );

      expect(sendUsersGroupStub).to.calledOnce;
      expect(sendForAllStub).to.not.called;
      expect(result).to.equal(11);
    });
  });

  describe('sendUsersGroup', () => {
    it('should send notices for a specific group of users', async () => {
      const userIds = ['user1', 'user2', 'user3'];

      const result = await service['sendUsersGroup'].call(
        { manager: TypeormMock.entityManager, chunkSize: 50 },
        TypeormMock.entityManager,
        userIds,
        createBatchNoticeMock,
      );

      expect(result).to.equal(userIds.length);
      expect(TypeormMock.entityManager.create).to.called;
      expect(TypeormMock.entityManager.getRepository.args[0][0]).to.equal(NoticeEntity);
      expect(TypeormMock.entityManager.create).to.callCount(userIds.length);
      expect(TypeormMock.entityManager.save).to.calledOnce;
    });
  });
});
