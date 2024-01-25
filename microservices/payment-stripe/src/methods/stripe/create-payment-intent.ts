import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsString, Length } from 'class-validator';
import { getManager } from 'typeorm';
import TransactionRole from '@constants/transaction-role';
import type Transaction from '@entities/transaction';
import Stripe from '@services/payment-gateway/stripe';

class PaymentIntentInput {
  @Length(1, 36)
  @IsString()
  userId: string;

  @Length(1, 36)
  @IsString()
  receiverId: string;

  @IsNumber()
  entityCost: number;

  @IsNumber()
  @IsUndefinable()
  applicationPaymentPercent?: number;

  @IsString()
  @IsUndefinable()
  title?: string;

  @IsString()
  @IsUndefinable()
  cardId?: string;

  @IsString()
  @IsUndefinable()
  entityId?: string;

  @IsEnum(TransactionRole)
  @IsUndefinable()
  feesPayer?: TransactionRole;

  @IsObject()
  @IsUndefinable()
  additionalFeesPercent?: Record<TransactionRole, number>;

  @IsNumber()
  @IsUndefinable()
  extraReceiverRevenuePercent?: number;

  @IsBoolean()
  @IsUndefinable()
  withTax?: boolean;
}

class PaymentIntentOutput {
  @IsObject()
  transaction: [Transaction, Transaction];
}

/**
 * Create PaymentIntent
 * @description Must be called from API
 */
const connectAccount = Endpoint.custom(
  () => ({
    input: PaymentIntentInput,
    output: PaymentIntentOutput,
    description: 'Create new PaymentIntent',
  }),
  async ({
    userId,
    entityCost,
    receiverId,
    applicationPaymentPercent,
    cardId,
    title,
    entityId,
    feesPayer,
    additionalFeesPercent,
    extraReceiverRevenuePercent,
    withTax,
  }) => {
    const service = await Stripe.init(getManager());

    return {
      transaction: await service.createPaymentIntent({
        userId,
        entityId,
        entityCost,
        receiverId,
        cardId,
        title,
        applicationPaymentPercent,
        feesPayer,
        additionalFeesPercent,
        extraReceiverRevenuePercent,
        withTax,
      }),
    };
  },
);

export default connectAccount;
