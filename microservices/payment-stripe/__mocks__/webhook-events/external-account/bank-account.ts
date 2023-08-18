import type StripeSdk from 'stripe';

const bankAccountEventMock = {
  id: 'ba_1NgUVtPD8VI1fs2v6gW4LCWO',
  object: 'bank_account',
  account: 'acct_1NgRQhPD8VI1fs2v',
} as StripeSdk.BankAccount;

// eslint-disable-next-line import/prefer-default-export
export { bankAccountEventMock };
