/**
 * Returns unit percent from amount
 */
const getPercentFromAmount = (amountUnit: number, percent?: number): number => {
  if (!percent) {
    return 0;
  }

  return amountUnit * (percent / 100);
};

export default getPercentFromAmount;
