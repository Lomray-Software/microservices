import toExpirationDate from '@helpers/formatters/to-expiration-date';

const cardMock = {
  id: 'card-id',
  userId: 'user-id',
  lastDigits: '4242',
  brand: 'visa',
  funding: 'debit',
  expired: toExpirationDate(1, 2040),
};

/* eslint-disable import/prefer-default-export */
export { cardMock };
