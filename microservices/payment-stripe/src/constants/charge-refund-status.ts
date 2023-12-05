enum ChargeRefundStatus {
  NO_REFUND = 'noRefund',
  PARTIAL_REFUND = 'partialRefund',
  // Full transaction amount refunded to sender. No matter with transfer or not
  FULL_REFUND = 'fullRefund',
}

export default ChargeRefundStatus;
