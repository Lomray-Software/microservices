import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import User from '@entities/user';
import UserRepository from '@repositories/user';
import ChangePassword from '@services/change-password';

describe('services/change-password', () => {
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const userId = 'user-id';
  const newPassword = 'new-password';
  const oldPassword = 'old-password';

  const mockUser = repository.create({
    id: userId,
    password: oldPassword,
  });

  before(async () => {
    await repository.encryptPassword(mockUser);
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should throw error: user not found', async () => {
    const service = ChangePassword.init({
      userId,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.change(newPassword, oldPassword))).to.throw('User not found');
  });

  it('should throw error: oldPassword or confirmation not provided', async () => {
    const service = ChangePassword.init({
      userId,
      repository,
    });

    expect(await waitResult(service.change(newPassword))).to.throw(
      'Either of confirm methods should be provided',
    );
  });

  it('should throw error: invalid old password', async () => {
    const service = ChangePassword.init({
      userId,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.change(newPassword, 'invalid-password'))).to.throw(
      'Invalid old password',
    );
  });

  it('should throw error: invalid confirmation', async () => {
    const service = ChangePassword.init({
      userId,
      repository,
      isConfirmed: () => false,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.change(newPassword))).to.throw('Invalid confirmation code');
  });

  it('should successful change password', async () => {
    const service = ChangePassword.init({
      userId,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    await service.change(newPassword, oldPassword);

    const [, user] = TypeormMock.entityManager.save.firstCall.args;

    expect(repository.isValidPassword(user as User, newPassword)).to.true;
  });
});
