import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
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

  repository.encryptPassword(mockUser);

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  it('should throw error: user not found', async () => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      repository,
      oldPassword,
    });

    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.change())).to.throw('User not found');
  });

  it('should throw error: oldPassword or confirmation not provided', async () => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      repository,
      oldPassword: '',
    });

    expect(await waitResult(service.change())).to.throw(
      'Either of confirm methods should be provided',
    );
  });

  it('should throw error: invalid old password', async () => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      repository,
      oldPassword: 'invalid-password',
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.change())).to.throw('Invalid old password');
  });

  it('should throw error: invalid confirmation', async () => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      repository,
      isConfirmed: () => false,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.change())).to.throw('Invalid confirmation code');
  });

  it('should successful change password', async () => {
    const service = ChangePassword.init({
      userId,
      newPassword,
      repository,
      oldPassword,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    await service.change();

    const [, user] = TypeormMock.entityManager.save.firstCall.args;

    expect(repository.isValidPassword(user, newPassword)).to.true;
  });
});
