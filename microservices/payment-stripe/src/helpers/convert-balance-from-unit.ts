import fromSmallestUnit from '@lomray/microservices-client-api/helpers/parsers/from-smallest-unit';
import BalanceType from '@constants/balance-type';
import TCurrency from '@interfaces/currency';
import type { TCustomerBalance } from '@services/payment-gateway/stripe';

/**
 * Convert unit balance from unit
 */
const convertBalanceFromUnit = (balance: TCustomerBalance): TCustomerBalance => {
  const currencies = { usd: 0, eur: 0 };
  const convertedInput: TCustomerBalance = {
    [BalanceType.INSTANT]: { ...currencies },
    [BalanceType.PENDING]: { ...currencies },
    [BalanceType.AVAILABLE]: { ...currencies },
  };

  Object.keys(balance).forEach((type: BalanceType) => {
    if (!convertedInput[type]) {
      convertedInput[type] = currencies;
    }

    Object.keys(balance[type]).forEach((currency: TCurrency) => {
      convertedInput[type][currency] = fromSmallestUnit(balance[type][currency]) ?? 0;
    });
  });

  return convertedInput;
};

export default convertBalanceFromUnit;
