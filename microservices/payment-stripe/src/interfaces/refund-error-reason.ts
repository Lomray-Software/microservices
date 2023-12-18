/**
 * Stripe refund error reason
 */
type TRefundErrorReason =
  | 'charge_for_pending_refund_disputed'
  | 'declined'
  | 'expired_or_canceled_card'
  | 'insufficient_funds'
  | 'lost_or_stolen_card'
  | 'merchant_request'
  | 'unknown';

export default TRefundErrorReason;
