import DisputeReason from '@constants/dispute-reason';
import DisputeStatus from '@constants/dispute-status';

const disputeMock = {
  id: 'dispute-id',
  transactionId: 'pi_3OIdULAmQ4asS8PS1dDLl0gN',
  disputeId: 'dp_1OJXjDAmQ4asS8PSWXnvmwpj',
  amount: 100,
  reason: DisputeReason.FRAUDULENT,
  status: DisputeStatus.NEEDS_RESPONSE,
  chargedAmount: 0,
  chargedFees: 0,
  netWorth: 0,
};

// eslint-disable-next-line import/prefer-default-export
export { disputeMock };
