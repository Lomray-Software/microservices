/**
 * Check if card expiration date valid
 */
const isCardExpirationDateValid = (date: string): boolean => {
  const currentDate = new Date();
  const [expirationMonth, expirationYear] = date.split('/');

  if (!expirationMonth || !expirationYear) {
    return false;
  }

  const expirationDate = new Date(
    getExpirationYear(expirationYear, currentDate),
    Number(expirationMonth),
    1,
  );

  expirationDate.setHours(0, 0, 0, 0);

  return expirationDate >= currentDate;
};

/**
 * Returns expiration year
 */
const getExpirationYear = (expirationYear: string, currentDate: Date): number => {
  const currentCentury = Math.floor(currentDate.getFullYear() / 100) * 100;

  let parsedExpirationYear = Number(expirationYear);

  if (parsedExpirationYear >= 0 && parsedExpirationYear <= 99) {
    parsedExpirationYear += currentCentury;
  }

  return parsedExpirationYear;
};

export default isCardExpirationDateValid;
