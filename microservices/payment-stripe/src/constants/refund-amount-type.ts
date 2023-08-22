/**
 * Refund amount type
 * @description Entity cost - 100, application fee - 5, fees payer - sender.
 * Sender will be charged on 103.2
 * Receiver revenue: 100 - 5 = 95
 * Application revenue: 5
 *
 * Refund revenue - 95
 * Refund entity cost - 100
 */
enum RefundAmountType {
  REVENUE = 'revenue',
  ENTITY_COST = 'entityCost',
}

export default RefundAmountType;
