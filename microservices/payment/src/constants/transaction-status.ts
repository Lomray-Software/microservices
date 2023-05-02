/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  SUCCEDED = 'succeded',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  ERROR = 'error',
}

export default TransactionStatus;
