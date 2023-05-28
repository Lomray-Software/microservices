import StripeSdk from 'stripe';
import TBalance from '@interfaces/balance';

/**
 * Compose balance according currency
 */
const composeBalance = (balances: StripeSdk.Balance.Available[]): TBalance => {
  const totalBalances: TBalance = {
    usd: 0,
    eur: 0,
  };

  for (const balance of balances) {
    if (totalBalances.hasOwnProperty(balance.currency)) {
      totalBalances[balance.currency] += balance.amount;
    } else {
      totalBalances[balance.currency] = balance.amount;
    }
  }

  return totalBalances;
};

export default composeBalance;
