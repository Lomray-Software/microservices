import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber } from 'class-validator';
import { getManager } from 'typeorm';
import TransactionRole from '@constants/transaction-role';
import Factory from '@services/payment-gateway/factory';

class PaymentIntentFeesInput {
  @IsNumber()
  entityCost: number;

  @IsEnum(TransactionRole)
  @IsUndefinable()
  feesPayer?: TransactionRole;

  @IsNumber()
  @IsUndefinable()
  applicationPaymentPercent?: number;

  @IsNumber()
  @IsUndefinable()
  additionalFeesPercent?: Record<TransactionRole, number>;

  @IsNumber()
  @IsUndefinable()
  extraReceiverRevenuePercent?: number;
}

class PaymentIntentFeesOutput {
  @IsNumber()
  paymentProviderFee: number;

  @IsNumber()
  applicationFee: number;

  @IsNumber()
  userAmount: number;

  @IsNumber()
  receiverRevenue: number;
}

/**
 * Returns calculated fees for payment intent
 * NOTE: Call from frontend for buy entity fees calculation
 */
const paymentIntentFees = Endpoint.custom(
  () => ({
    input: PaymentIntentFeesInput,
    output: PaymentIntentFeesOutput,
    description: 'Returns calculated fees for payment intent',
  }),
  async ({
    entityCost,
    extraReceiverRevenuePercent,
    applicationPaymentPercent,
    additionalFeesPercent,
    feesPayer,
  }) => {
    const service = await Factory.create(getManager());

    const entityUnitCost = service.toSmallestCurrencyUnit(entityCost);

    const unitFees = await service.getPaymentIntentFees({
      entityUnitCost,
      extraReceiverRevenuePercent,
      feesPayer,
      additionalFeesPercent,
      applicationPaymentPercent,
    });

    return Object.fromEntries(
      Object.entries(unitFees).map(([title, amount]) => {
        const newKey = title.replace('Unit', '');

        return [newKey, service.fromSmallestCurrencyUnit(amount)];
      }),
    ) as unknown as PaymentIntentFeesOutput;
  },
);

export default paymentIntentFees;
