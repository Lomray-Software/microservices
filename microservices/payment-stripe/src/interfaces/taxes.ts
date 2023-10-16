/**
 * Shared taxes options
 */
interface ITaxes {
  // Estimated default tax percent
  defaultPercent: number;
  // Stable cost unit for automatic compute tax
  stableUnit: number;
}

export default ITaxes;
