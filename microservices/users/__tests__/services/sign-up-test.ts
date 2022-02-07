import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { waitResult } from '@lomray/microservice-helpers/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import UserRepository from '@repositories/user';
import SignUp from '@services/sign-up';

describe('services/sign-up', () => {
  const sandbox = sinon.createSandbox();
  const repository = TypeormMock.entityManager.getCustomRepository(UserRepository);
  const fields = {
    firstName: 'Mike',
    phone: '+375291112233',
    email: 'demo@email.com',
  };
  const isConfirmed = () => true;

  beforeEach(() => {
    TypeormMock.sandbox.reset();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error: fields validation', async () => {
    const service = SignUp.init({
      fields: {},
      isConfirmed,
      repository,
    });

    expect(await waitResult(service.register())).to.throw('Validation failed');
  });

  it('should throw error: pass both phone & email', async () => {
    const service = SignUp.init({
      fields,
      isConfirmed,
      repository,
    });

    expect(await waitResult(service.register())).to.throw(
      'Either email or phone number must be sent',
    );
  });

  it('should throw error: confirmation failed', async () => {
    const service = SignUp.init({
      fields: {
        firstName: fields.firstName,
        email: fields.email,
      },
      isConfirmed: () => false,
      repository,
    });

    expect(await waitResult(service.register())).to.throw('Invalid confirmation code');
  });

  it('should create new user & hash password', async () => {
    const service = SignUp.init({
      fields: {
        firstName: fields.firstName,
        email: fields.email,
      },
      isConfirmed,
      repository,
    });
    const mockUser = { id: 'user-id' };

    TypeormMock.entityManager.save.resolves(mockUser);

    const user = await service.register();

    expect(mockUser).to.deep.equal(user);
  });
});
