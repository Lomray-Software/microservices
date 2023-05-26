/**
 * Returns decomposed card expiration
 * NOTE: Compatible with the stripe
 */
const fromExpirationDate = (expirationDate: string): { year: number; month: number } => {
  const [formattedMonth, formattedYear] = expirationDate.split('/');

  const month = Number.parseInt(formattedMonth, 10);
  const year = 2000 + Number.parseInt(formattedYear, 10);

  return { year, month };
};

export default fromExpirationDate;
