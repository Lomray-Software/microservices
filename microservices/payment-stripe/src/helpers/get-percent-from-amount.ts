/**
 * Returns unit percent from amount
 */
const getPercentFromAmount = (amountUnit: number, percent?: number): number => {
  if (!percent || percent > 100) {
    return 0;
  }

  return Math.round(amountUnit * (percent / 100));
};

export default getPercentFromAmount;
