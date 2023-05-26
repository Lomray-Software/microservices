import { expect } from 'chai';
import toExpirationDate from '@helpers/formatters/to-expiration-date';

describe('helpers/formatters/to-expiration-date', () => {
  it('should return the correct expiration date', () => {
    expect(toExpirationDate(12, 2025)).to.equal('12/25');
  });

  it('should correctly format single-digit month and year', () => {
    expect(toExpirationDate(6, 2023)).to.equal('06/23');
  });

  it('should correctly format two-digit month and year', () => {
    expect(toExpirationDate(8, 2031)).to.equal('08/31');
  });

  it('should handle wrong input params', () => {
    // @ts-ignore
    expect(toExpirationDate(Number.NaN, undefined)).to.equal('NaN/ed');
  });
});
