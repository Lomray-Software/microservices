import StripeSdk from 'stripe';

/**
 * Check if external account is bank account
 */
const isExternalAccountIsBankAccount = (
  externalAccount: StripeSdk.BankAccount | StripeSdk.Card,
): externalAccount is StripeSdk.BankAccount => externalAccount.object.startsWith('ba');

export default isExternalAccountIsBankAccount;
