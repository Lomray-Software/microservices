import { expect } from 'chai';
import fromExpirationDate from '@helpers/formatters/from-expiration-date';

describe('helpers/formatters/from-expiration-date', () => {
  it('should return the correct year and month', () => {
    expect(fromExpirationDate('12/25')).to.deep.equal({ year: 2025, month: 12 });
  });

  it('should correctly parse single-digit month and year', () => {
    expect(fromExpirationDate('06/23')).to.deep.equal({ year: 2023, month: 6 });
  });

  it('should correctly parse two-digit month and year', () => {
    expect(fromExpirationDate('08/31')).to.deep.equal({ year: 2031, month: 8 });
  });

  it('should handle wrong input params', () => {
    expect(fromExpirationDate('invalid-date')).to.deep.equal({
      year: Number.NaN,
      month: Number.NaN,
    });
  });
});
