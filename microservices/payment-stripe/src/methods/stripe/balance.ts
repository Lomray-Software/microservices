import { Endpoint } from '@lomray/microservice-helpers';
import { IsObject, IsString, Length } from 'class-validator';
import BalanceType from '@constants/balance-type';
import convertBalanceFromUnit from '@helpers/convert-balance-from-unit';
import TBalance from '@interfaces/balance';
import Stripe from '@services/payment-gateway/stripe';

class BalanceInput {
  @Length(1, 36)
  @IsString()
  userId: string;
}

class BalanceOutput {
  @IsObject()
  balance: Record<BalanceType, TBalance>;
}

/**
 * Returns balance
 */
const balance = Endpoint.custom(
  () => ({
    input: BalanceInput,
    output: BalanceOutput,
    description: 'Returns balance',
  }),
  async ({ userId }) => {
    const service = await Stripe.init();

    return {
      balance: convertBalanceFromUnit(await service.getBalance(userId)),
    };
  },
);

export default balance;
