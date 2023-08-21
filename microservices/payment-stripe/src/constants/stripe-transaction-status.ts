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
  // Example: Card declined - high fraud risk
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REFUND_SUCCEEDED = 'refund_succeeded',
  REFUND_PENDING = 'refund_pending',
  REFUND_CANCELED = 'refund_canceled',
  REFUND_FAILED = 'refund_failed',
  CANCELED = 'canceled',
}

export default TransactionStatus;
