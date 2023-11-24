/**
 * Shared taxes options
 */
interface ITaxes {
  // Estimated default tax percent
  defaultPercent: number;
  // Create tax transaction fee
  stableUnit: number;
  // Tax auto Stripe calculation fee
  autoCalculateFeeUnit: number;
}

export default ITaxes;
