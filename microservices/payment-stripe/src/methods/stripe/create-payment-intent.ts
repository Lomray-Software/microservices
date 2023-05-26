import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import TransactionRole from '@constants/transaction-role';
import type Transaction from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';

class PaymentIntentInput {
  @IsString()
  userId: string;

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
}

class PaymentIntentOutput {
  @IsObject()
  transaction: [Transaction, Transaction];
}

/**
 * Create PaymentIntent
 * NOTE: Must be called from API
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
  }) => {
    const service = await Factory.create(getManager());

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
      }),
    };
  },
);

export default connectAccount;
