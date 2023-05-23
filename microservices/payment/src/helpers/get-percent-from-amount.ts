/**
 * Returns unit percent from amount
 */
const getPercentFromAmount = (amountUnit: number, percent: number): number =>
  amountUnit * (percent / 100);

export default getPercentFromAmount;
