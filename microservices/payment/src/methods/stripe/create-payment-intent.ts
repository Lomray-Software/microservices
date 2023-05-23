import { Endpoint, IsUndefinable } from '@lomray/microservice-helpers';
import { IsNumber, IsObject, IsString } from 'class-validator';
import { getManager } from 'typeorm';
import remoteConfig from '@config/remote';
import type Transaction from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';
import Stripe from '@services/payment-gateway/stripe';

class PaymentIntentInput {
  @IsString()
  userId: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  receiverId: string;

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
}

class PaymentIntentOutput {
  @IsObject()
  transaction: Transaction;
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
    totalAmount,
    receiverId,
    applicationPaymentPercent,
    cardId,
    title,
    entityId,
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
        totalAmount,
        receiverId,
        cardId,
        title,
        applicationPaymentPercent,
      }),
    };
  },
);

export default connectAccount;
