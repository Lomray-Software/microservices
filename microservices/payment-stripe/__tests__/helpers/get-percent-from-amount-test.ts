import { expect } from 'chai';
import getPercentFromAmount from '@helpers/get-percent-from-amount';

describe('helpers/get-percent-from-amount', () => {
  it('should calculate the correct percentage', () => {
    const amountUnit = 100;
    const percent = 20;
    const expectedResult = 20;

    const result = getPercentFromAmount(amountUnit, percent);

    expect(result).to.equal(expectedResult);
  });

  it('should handle zero amountUnit', () => {
    const amountUnit = 0;
    const percent = 50;
    const expectedResult = 0;

    const result = getPercentFromAmount(amountUnit, percent);

    expect(result).to.equal(expectedResult);
  });

  it('should handle zero percent', () => {
    const amountUnit = 100;
    const percent = 0;
    const expectedResult = 0;

    const result = getPercentFromAmount(amountUnit, percent);

    expect(result).to.equal(expectedResult);
  });

  it('should handle negative percent', () => {
    const amountUnit = 200;
    const percent = -25;
    const expectedResult = -50;

    const result = getPercentFromAmount(amountUnit, percent);

    expect(result).to.equal(expectedResult);
  });
});
