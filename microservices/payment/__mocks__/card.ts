import CardType from '@constants/card-type';
import toExpirationDate from '@helpers/formatters/to-expiration-date';

const cardMock = {
  cardId: 'card-id',
  userId: 'user-id',
  lastDigits: '4242',
  type: CardType.VISA,
  expired: toExpirationDate(1, 2040),
};

/* eslint-disable import/prefer-default-export */
export { cardMock };
