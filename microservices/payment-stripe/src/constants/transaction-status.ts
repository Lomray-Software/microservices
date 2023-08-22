/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  SUCCESS = 'success',
  IN_PROCESS = 'inProcess',
  REQUIRED_PAYMENT = 'requiredPayment',
  // Not handled stripe entity (transaction or refund)
  INITIAL = 'initial',
  EXPIRED = 'expired',
  // Full amount was refunded
  REFUNDED = 'refunded',
  // Partial amount was refunded
  PARTIAL_REFUNDED = 'partialRefunded',
  REFUND_FAILED = 'refundFailed',
  REFUND_CANCELED = 'refundCanceled',
  REFUND_IN_PROCESS = 'refundInProcess',
  ERROR = 'error',
}

export default TransactionStatus;
