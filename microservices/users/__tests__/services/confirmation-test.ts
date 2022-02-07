import { TypeormMock } from '@lomray/microservice-helpers/mocks';
import { expect } from 'chai';
import ConfirmCode from '@entities/confirm-code';
import Email from '@services/confirm/email';
import { Factory, ConfirmBy } from '@services/confirm/factory';
import Phone from '@services/confirm/phone';

describe('services/confirmation', () => {
  const repository = TypeormMock.entityManager.getRepository(ConfirmCode);

  it('should return email confirmation service', () => {
    const service = Factory.create(ConfirmBy.email, repository);

    expect(service).to.instanceof(Email);
  });

  it('should return phone confirmation service', () => {
    const service = Factory.create(ConfirmBy.phone, repository);

    expect(service).to.instanceof(Phone);
  });
});
