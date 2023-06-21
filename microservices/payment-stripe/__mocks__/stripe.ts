import StripeSdk from 'stripe';

const accountIdMock = 'acct_1LO435FpQjUWTpHe';

const clientSecretMock = 'seti_1GySTa2eZvKYlo2CPgV8c13b_secret_HXXYSpO0ajOvGepD047cr8FKg5KUA4G';

const customerMock = {
  id: 'cus_NshmwHkITU8Egm',
  object: 'customer',
  description: 'Mike',
  // eslint-disable-next-line camelcase
  invoice_settings: {
    // eslint-disable-next-line camelcase
    default_payment_method: null,
  },
} as StripeSdk.Customer;

const accountMock = {
  id: accountIdMock,
  object: 'account',
};

const accountLinkMock = {
  object: 'account_link',
  created: 3333333,
  // eslint-disable-next-line camelcase
  expires_at: 123123123,
  url: `https://connect.stripe.com/setup/s/${accountIdMock}/TvOcRxUomn6d`,
};

const balancesMock: StripeSdk.Balance = {
  livemode: false,
  pending: [{ currency: 'usd', amount: 0 }],
  object: 'balance',
  available: [{ currency: 'usd', amount: 1000 }],
};

const paymentMethodId = 'payment-method-id';

export {
  customerMock,
  clientSecretMock,
  accountMock,
  accountLinkMock,
  balancesMock,
  paymentMethodId,
};
