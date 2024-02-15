import type { IParams } from '@entities/transaction';

/**
 * In whole cases this data is required and usable
 * @description Avoid 2 exports in transaction entity file
 */
const defaultParams: Pick<
  IParams,
  | 'refundedTransactionAmount'
  | 'refundedApplicationFeeAmount'
  | 'platformFee'
  | 'stripeFee'
  | 'extraFee'
  | 'baseFee'
  | 'personalFee'
  | 'transferAmount'
  | 'transferReversedAmount'
> = {
  refundedTransactionAmount: 0,
  refundedApplicationFeeAmount: 0,
  transferReversedAmount: 0,
  platformFee: 0,
  stripeFee: 0,
  extraFee: 0,
  baseFee: 0,
  personalFee: 0,
  transferAmount: 0,
};

export default defaultParams;
