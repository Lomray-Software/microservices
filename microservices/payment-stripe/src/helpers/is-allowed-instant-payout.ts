import type { TAvailablePaymentMethods } from '@services/payment-gateway/stripe';

/**
 * Check is allowed instant payout
 */
const isAllowedInstantPayout = (availablePayoutMethods?: TAvailablePaymentMethods): boolean =>
  Boolean(availablePayoutMethods && availablePayoutMethods.includes('instant'));

export default isAllowedInstantPayout;
