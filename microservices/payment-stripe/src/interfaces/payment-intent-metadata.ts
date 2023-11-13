import type TransactionRole from '@constants/transaction-role';
import type { IComputedTax } from '@entities/transaction';

/**
 * Stripe Payment Intent metadata
 */
interface IPaymentIntentMetadata
  extends Omit<IComputedTax, 'taxTransactionAmountWithTaxUnit' | 'taxTotalAmountUnit'> {
  senderId: string;
  receiverId: string;
  entityCost: string;
  cardId: string;
  feesPayer: TransactionRole;
  applicationFee: string;
  receiverExtraFee: string;
  senderExtraFee: string;
  receiverExtraRevenue: string;
  paymentProviderFee: string;
  entityId?: string;
  title?: string;
  taxTransactionAmountWithTax?: number;
  taxTotalAmount?: number;
  taxFee?: number;
  totalTaxPercent?: number;
  creditTransactionId?: string;
  debitTransactionId?: string;
  // Tax transaction
  taxTransactionId?: string;
}

export default IPaymentIntentMetadata;
