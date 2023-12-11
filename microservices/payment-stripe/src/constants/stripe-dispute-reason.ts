enum StripeDisputeReason {
  BANK_CANNOT_PROCESS = 'bank_cannot_process',
  CHECK_RETURNED = 'check_returned',
  CREDIT_NOT_PROCESSED = 'credit_not_processed',
  CUSTOMER_INITIATED = 'customer_initiated',
  DEBIT_NOT_AUTHORIZED = 'debit_not_authorized',
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  GENERAL = 'general',
  INCORRECT_ACCOUNT_DETAILS = 'incorrect_account_details',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_UNACCEPTABLE = 'product_unacceptable',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  UNRECOGNIZED = 'unrecognized',
}

export default StripeDisputeReason;
