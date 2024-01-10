interface IPayout {
  // Instant payout minimum amount
  instantMinAmountPerDay: number;
  // Instant payout maximum amount
  instantMaxAmountPerDay: number;
  // Limit for performing instant payout
  instantPayoutLimitPerDay: number;
}

export default IPayout;
