interface IPayout {
  // Instant payout minimum amount
  instantMinAmountPerTransaction: number;
  // Instant payout maximum amount
  instantMaxAmountPerTransaction: number;
  // Limit for performing instant payout
  instantPayoutLimitPerDay: number;
}

export default IPayout;
