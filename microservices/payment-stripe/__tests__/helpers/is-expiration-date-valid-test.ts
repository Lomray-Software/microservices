import { expect } from 'chai';
import sinon from 'sinon';
import isCardExpirationDateValid from '@helpers/is-card-expiration-date-valid';

describe('helpers/is-card-expiration-date-valid', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date('2023-05-01').getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  it('should return true for a valid expiration date in the future', () => {
    expect(isCardExpirationDateValid('12/25')).to.be.true;
  });

  it('should return false for an expired expiration date', () => {
    expect(isCardExpirationDateValid('01/22')).to.be.false;
  });

  it('should return false for an incomplete expiration date', () => {
    expect(isCardExpirationDateValid('05/')).to.be.false;
  });

  it('should return false for an invalid expiration date', () => {
    expect(isCardExpirationDateValid('invalid-date')).to.be.false;
  });
});
