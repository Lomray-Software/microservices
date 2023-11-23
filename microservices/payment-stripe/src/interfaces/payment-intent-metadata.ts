import TransactionRole from '@constants/transaction-role';
import { IComputedTax, IParams as ITransactionParams } from '@entities/transaction';

export interface IPaymentIntentMetadata
  extends Omit<IComputedTax, 'taxTransactionAmountWithTaxUnit' | 'taxTotalAmountUnit'>,
    Pick<ITransactionParams, 'baseFee'> {
  senderId: string;
  receiverId: string;
  entityCost: string;
  cardId: string;
  feesPayer: TransactionRole;
  platformFee: string;
  receiverExtraFee: string;
  receiverPersonalFee: string;
  senderExtraFee: string;
  senderPersonalFee: string;
  receiverExtraRevenue: string;
  receiverRevenue: string;
  stripeFee: string;
  // Total collected fee (includes all fees and tax that collected via application fee)
  fee: string;
  entityId?: string;
  title?: string;
  taxTransactionAmountWithTax?: number;
  taxTotalAmount?: number;
  taxFee?: number;
  totalTaxPercent?: number;
  taxAutoCalculateFee?: number;
  taxTransactionId?: number;
}
