import { expect } from 'chai';
import { bankAccountMock } from '@__mocks__/bank-account';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';

describe('helpers/extract-id-from-stripe-instance', () => {
  it('should return the id if stripe instance is a string', () => {
    expect(extractIdFromStripeInstance(bankAccountMock.id)).to.equal(bankAccountMock.id);
  });

  it('should return the id from the stripe bank account object', () => {
    expect(extractIdFromStripeInstance(bankAccountMock)).to.equal(bankAccountMock.id);
  });
});
