/**
 * Check if card expiration date valid
 */
const isCardExpirationDateValid = (date: string) => {
  const currentDate = new Date();
  const [expirationMonth, expirationYear] = date.split('/');

  if (!expirationMonth || !expirationYear) {
    return false;
  }

  const expirationDate = new Date(Number(expirationYear), Number(expirationMonth) - 1, 1);

  expirationDate.setHours(0, 0, 0, 0);

  return expirationDate >= currentDate;
};

export default isCardExpirationDateValid;
