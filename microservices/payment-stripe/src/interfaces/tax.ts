interface ITax {
  id: string;
  transactionAmountWithTaxUnit: number;
  // If tax expired - tax CAN NOT BE attached to transaction
  expiresAt: Date;
  createdAt: Date;
}

export default ITax;
