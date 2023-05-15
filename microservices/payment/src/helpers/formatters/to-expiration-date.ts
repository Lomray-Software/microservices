/**
 * Returns composed card expiration
 * NOTE: Compatible with the stripe
 */
const toExpirationDate = (month: number, year: number): string => {
  const formattedYear = year.toString().slice(-2);

  const formattedMonth = month.toString().padStart(2, '0');

  return `${formattedMonth}/${formattedYear}`;
};

export default toExpirationDate;
