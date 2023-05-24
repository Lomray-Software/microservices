/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  NO_PAYMENT_REQUIRED = 'no_payment_required',
  ERROR = 'error',
  SUCCEEDED = 'succeeded',
  PAYMENT_FAILED = 'payment_failed',
  PROCESSING = 'processing',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
}

export default TransactionStatus;
