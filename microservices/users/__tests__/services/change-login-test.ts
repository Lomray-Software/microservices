import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import UserRepository from '@repositories/user';
import ChangeLogin from '@services/change-login';
import { ConfirmBy } from '@services/confirm/factory';

describe('services/change-login', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const fields = {
    userId: 'user-id',
    login: 'demo@email.com',
    confirmBy: ConfirmBy.email,
  };
  const isConfirmed = () => true;

  const mockUser = repository.create({
    id: fields.userId,
    firstName: 'Mike',
  });

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: confirmation failed', async () => {
    const service = ChangeLogin.init({
      ...fields,
      isConfirmed: () => false,
      repository,
    });

    expect(await waitResult(service.change())).to.throw('Invalid confirmation code');
  });

  it('should throw error: user not exist', async () => {
    const service = ChangeLogin.init({
      ...fields,
      isConfirmed,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(undefined);

    expect(await waitResult(service.change())).to.throw('User not found');
  });

  it('should throw error: validation failed', async () => {
    const service = ChangeLogin.init({
      ...fields,
      login: 'not-valid-email',
      isConfirmed,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);

    expect(await waitResult(service.change())).to.throw('Validation failed');
  });

  it('should successful change login', async () => {
    const service = ChangeLogin.init({
      ...fields,
      isConfirmed,
      repository,
    });

    TypeormMock.entityManager.findOne.resolves(mockUser);
    TypeormMock.entityManager.save.resolves(mockUser);

    const user = await service.change();

    expect(mockUser).to.deep.equal(user);
  });
});
