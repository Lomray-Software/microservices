import TaxBehaviour from '@constants/tax-behaviour';

interface ITax {
  id: string;
  transactionAmountWithTaxUnit: number;
  // If tax expired - tax CAN NOT BE attached to transaction
  expiresAt: Date;
  createdAt: Date;
  // Tax pure total amount
  totalAmountUnit: number;
  totalTaxPercent: number;
  behaviour: TaxBehaviour;
}

export default ITax;
