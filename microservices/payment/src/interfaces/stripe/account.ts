import StripeAccountTypes from '@constants/stripe-acoount-types';
import AccountCapabilityStatus from '@constants/stripe/account-capability-status';

type TCapability = 'card_payments' | 'transfers';
/**
 * Connect account
 * NOTE: We support only standard account type
 */
interface IAccount {
  id: string;
  object: string;
  type: StripeAccountTypes;
  charges_enabled: boolean;
  capabilities: Record<TCapability, AccountCapabilityStatus>;
  payouts_enabled: boolean;
}

export default IAccount;
