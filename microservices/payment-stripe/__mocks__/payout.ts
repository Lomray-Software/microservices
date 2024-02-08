import PayoutMethod from '@constants/payout-method';
import PayoutStatus from '@constants/payout-status';
import PayoutType from '@constants/payout-type';

const currentDate = new Date();

const payoutMock = {
  id: 'd58fddc4-38dd-48f6-9ead-f5caad77f808',
  payoutId: 'po_1OXlAzPPML92qP0h9I4hx5bP',
  amount: 1000,
  destination: 'ba_1O4OnkPPML92qP0hRL5BwJIe',
  method: PayoutMethod.INSTANT,
  type: PayoutType.BANK_ACCOUNT,
  status: PayoutStatus.PAID,
  currency: 'usd',
  failureCode: null,
  failureMessage: null,
  description: null,
  arrivalDate: currentDate,
  registeredAt: currentDate,
  params: {},
};

// eslint-disable-next-line import/prefer-default-export
export { payoutMock };
