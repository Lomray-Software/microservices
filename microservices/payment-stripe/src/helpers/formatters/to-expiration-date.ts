/**
 * Returns composed card expiration
 * NOTE: Compatible with the stripe
 */
const toExpirationDate = (month: number, year: number): string => {
  const formattedYear = String(year).slice(-2);

  const formattedMonth = String(month).padStart(2, '0');

  return `${formattedMonth}/${formattedYear}`;
};

export default toExpirationDate;
