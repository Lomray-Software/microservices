import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import TransactionRole from '@constants/transaction-role';
import type Transaction from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

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
}

class PaymentIntentOutput {
  @IsObject()
  transaction: [Transaction, Transaction];
}

/**
 * Create PaymentIntent
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
  }) => {
    const { paymentOptions } = await remoteConfig();

    if (!paymentOptions) {
      throw new Error('Payment intent only suitable for the stripe payment provider');
    }

    const service = (await Factory.create(getManager())) as Stripe;

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
      }),
    };
  },
);

export default connectAccount;
