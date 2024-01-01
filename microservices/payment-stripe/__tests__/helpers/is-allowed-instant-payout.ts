import { expect } from 'chai';
import isAllowedInstantPayout from '@helpers/is-allowed-instant-payout';
import type { TAvailablePaymentMethods } from '@services/payment-gateway/stripe';

describe('helpers/is-allowed-instant-payout', () => {
  it('should return true when instant payout is allowed', () => {
    expect(isAllowedInstantPayout(['instant', 'standard'])).to.true;
  });

  it('should return false when instant payout is not allowed', () => {
    const availablePayoutMethods: (TAvailablePaymentMethods | undefined)[] = [
      ['standard'],
      [],
      undefined,
    ];

    for (const availablePayoutMethod of availablePayoutMethods) {
      expect(isAllowedInstantPayout(availablePayoutMethod)).to.false;
    }
  });
});
