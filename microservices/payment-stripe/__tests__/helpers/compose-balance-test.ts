import { expect } from 'chai';
import type StripeSdk from 'stripe';
import composeBalance from '@helpers/compose-balance';
import type TBalance from '@interfaces/balance';

describe('helpers/compose-balance', () => {
  let totalBalances: TBalance;

  beforeEach(() => {
    totalBalances = {
      usd: 0,
      eur: 0,
    };
  });

  it('should return total balances with zero amounts for USD and EUR if no balances are provided', () => {
    const balances: StripeSdk.Balance.Available[] = [];

    const res = composeBalance(balances);

    expect(res).to.deep.equal(totalBalances);
  });

  it('should return total balances with correct amounts for USD and EUR when balances are provided', () => {
    const balances: StripeSdk.Balance.Available[] = [
      { currency: 'usd', amount: 100 },
      { currency: 'eur', amount: 200 },
      { currency: 'usd', amount: 50 },
    ];
    const expected: TBalance = {
      usd: 150,
      eur: 200,
    };

    const res = composeBalance(balances);

    expect(res).to.deep.equal(expected);
  });

  it('should add amounts correctly when balances have the same currency', () => {
    const balances: StripeSdk.Balance.Available[] = [
      { currency: 'usd', amount: 100 },
      { currency: 'usd', amount: 200 },
      { currency: 'usd', amount: 50 },
    ];
    const expected: TBalance = {
      usd: 350,
      eur: 0,
    };

    const res = composeBalance(balances);

    expect(res).to.deep.equal(expected);
  });
});
