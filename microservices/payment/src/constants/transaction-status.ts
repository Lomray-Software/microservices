/**
 * Enum for storing transaction status
 */
enum TransactionStatus {
  SUCCESS = 'success',
  IN_PROCESS = 'inProcess',
  REQUIRED_PAYMENT = 'requiredPayment',
  INITIAL = 'initial',
  EXPIRED = 'expired',
  ERROR = 'error',
}

export default TransactionStatus;