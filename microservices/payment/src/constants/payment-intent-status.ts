/**
 * Enum for storing payment intent status
 */
enum PaymentIntentStatus {
  SUCCEDED = 'succeded',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
}

export default PaymentIntentStatus;
