/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  SUCCESS = 'success',
  IN_PROCESS = 'inProcess',
  REQUIRED_PAYMENT = 'requiredPayment',
  INITIAL = 'initial',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  REFUND_FAILED = 'refundFailed',
  REFUND_CANCELED = 'refundCanceled',
  REFUND_IN_PROCESS = 'refundInProcess',
  ERROR = 'error',
}

export default TransactionStatus;
