interface IPayout {
  // Instant payout minimum amount
  instantMinAmountPerTransactionUnit: number;
  // Instant payout maximum amount
  instantMaxAmountPerTransactionUnit: number;
  // Limit for performing instant payout
  instantPayoutLimitPerDay: number;
}

export default IPayout;
