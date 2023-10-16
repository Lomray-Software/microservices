import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
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

  @JSONSchema({
    description: 'Should calculate and include estimated tax for transaction',
  })
  @IsBoolean()
  @IsUndefinable()
  shouldEstimateTax?: boolean;

  @JSONSchema({
    description: 'Should include stripe fee in calculation result',
  })
  @IsBoolean()
  @IsUndefinable()
  withStripeFee?: boolean;
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

  @IsNumber()
  @IsUndefinable()
  estimatedTaxPercent?: number;

  @IsNumber()
  @IsUndefinable()
  estimatedTax?: number;
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
    shouldEstimateTax,
    withStripeFee,
  }) => {
    const service = await Factory.create(getManager());

    const entityUnitCost = service.toSmallestCurrencyUnit(entityCost);

    const unitFees = await service.getPaymentIntentFees({
      entityUnitCost,
      extraReceiverRevenuePercent,
      feesPayer,
      additionalFeesPercent,
      applicationPaymentPercent,
      shouldEstimateTax,
      withStripeFee,
    });

    return Object.fromEntries(
      Object.entries(unitFees).map(([title, amount]) => {
        const newKey = title.replace('Unit', '');

        return [
          newKey,
          !newKey.includes('Percent') ? service.fromSmallestCurrencyUnit(amount as number) : amount,
        ];
      }),
    ) as unknown as PaymentIntentFeesOutput;
  },
);

export default paymentIntentFees;
