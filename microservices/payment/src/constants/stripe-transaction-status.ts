/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  NO_PAYMENT_REQUIRED = 'no_payment_required',
  ERROR = 'error',
}

export default TransactionStatus;
