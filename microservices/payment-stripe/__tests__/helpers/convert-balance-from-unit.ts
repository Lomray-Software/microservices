import { expect } from 'chai';
import convertBalanceFromUnit from '@helpers/convert-balance-from-unit';

describe('helpers/convert-balance-from-unit', () => {
  it('should correctly convert balance: pending usd balance', () => {
    expect(
      convertBalanceFromUnit({
        available: { usd: 0, eur: 0 },
        instant: { usd: 0, eur: 0 },
        pending: { usd: 2820000, eur: 0 },
      }),
    ).to.deep.equal({
      available: { usd: 0, eur: 0 },
      instant: { usd: 0, eur: 0 },
      pending: { usd: 28200, eur: 0 },
    });
  });

  it('should correctly convert balance: whole usd balances', () => {
    expect(
      convertBalanceFromUnit({
        available: { usd: 100, eur: 0 },
        instant: { usd: 2000000, eur: 0 },
        pending: { usd: 2820000, eur: 0 },
      }),
    ).to.deep.equal({
      available: { usd: 1, eur: 0 },
      instant: { usd: 20000, eur: 0 },
      pending: { usd: 28200, eur: 0 },
    });
  });
});
