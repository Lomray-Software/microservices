import type RefundAmountType from '@constants/refund-amount-type';

// @TODO: Add usages
interface IRefundMetadata {
  entityId?: string;
  refundAmountType?: RefundAmountType;
  type?: string;
}

export default IRefundMetadata;
