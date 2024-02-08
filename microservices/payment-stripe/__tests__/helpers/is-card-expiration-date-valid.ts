import { expect } from 'chai';
import sinon from 'sinon';
import isCardExpirationDateValid from '@helpers/is-card-expiration-date-valid';

describe('helpers/is-card-expiration-date-valid', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    const currentDate = new Date('2024-01-30');

    clock = sinon.useFakeTimers(currentDate);
  });

  afterEach(() => {
    clock.restore();
  });

  it('should be valid: expiration date is valid', () => {
    expect(isCardExpirationDateValid('02/25')).to.true;
  });

  it('should be valid: current month - last card month', () => {
    expect(isCardExpirationDateValid('01/24')).to.true;
  });

  it('should not be valid: expiration month is missing', () => {
    expect(isCardExpirationDateValid('/25')).to.false;
  });

  it('should not be valid: expiration year is missing', () => {
    expect(isCardExpirationDateValid('02/')).to.false;
  });

  it('should not be valid: expiration date is in the past', () => {
    expect(isCardExpirationDateValid('12/23')).to.false;
  });
});
