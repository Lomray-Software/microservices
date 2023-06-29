import StripeSdk from 'stripe';

/**
 * Get is stripe bank account
 */
const getIsStripeBankAccount = (
  externalAccount: StripeSdk.BankAccount | StripeSdk.Card,
): externalAccount is StripeSdk.BankAccount => externalAccount.object === 'bank_account';

export default getIsStripeBankAccount;
