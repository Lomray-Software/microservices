const configMock = {
  fees: {
    paymentPercent: 2.9,
    stablePaymentUnit: 30, // $0.3
    stableDisputeFeeUnit: 1500, // $15
    instantPayoutPercent: 1,
  },
  taxes: {
    defaultPercent: 8,
    stableUnit: 50, // $0.5
    autoCalculateFeeUnit: 5, // $0.05
  },
};

/* eslint-disable import/prefer-default-export */
export { configMock };
