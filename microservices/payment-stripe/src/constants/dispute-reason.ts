enum DisputeReason {
  BANK_CANNOT_PROCESS = 'bankCannotProcess',
  CHECK_RETURNED = 'checkReturned',
  CREDIT_NOT_PROCESSED = 'creditNotProcessed',
  CUSTOMER_INITIATED = 'customerInitiated',
  DEBIT_NOT_AUTHORIZED = 'debitNotAuthorized',
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  GENERAL = 'general',
  INCORRECT_ACCOUNT_DETAILS = 'incorrectAccountDetails',
  INSUFFICIENT_FUNDS = 'insufficientFunds',
  PRODUCT_NOT_RECEIVED = 'productNotReceived',
  PRODUCT_UNACCEPTABLE = 'productUnacceptable',
  SUBSCRIPTION_CANCELED = 'subscriptionCanceled',
  UNRECOGNIZED = 'unrecognized',
}

export default DisputeReason;
