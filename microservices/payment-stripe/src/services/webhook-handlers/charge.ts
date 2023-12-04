import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import TransactionStatus from '@constants/transaction-status';
import TransactionEntity from '@entities/transaction';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';

/**
 * Charge webhook handler
 */
class Charge {
  /**
   * Handles charge refunded
   */
  public async handleChargeRefunded(event: StripeSdk.Event, manager: EntityManager): Promise<void> {
    const transactionRepository = manager.getRepository(TransactionEntity);
    const {
      status,
      payment_intent: paymentIntent,
      amount_refunded: refundedTransactionAmount,
      amount,
    } = event.data.object as StripeSdk.Charge;

    if (!paymentIntent || !status) {
      throw new BaseException({
        status: 500,
        message: "Payment intent id or refund status wasn't provided.",
      });
    }

    const transactions = await transactionRepository.find({
      transactionId: extractIdFromStripeInstance(paymentIntent),
    });

    if (!transactions.length) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to handle charge refunded event. Debit or credit transaction',
        ),
      });
    }

    transactions.forEach((transaction) => {
      transaction.status =
        refundedTransactionAmount < amount
          ? TransactionStatus.PARTIAL_REFUNDED
          : TransactionStatus.REFUNDED;
      transaction.params.refundedTransactionAmount = refundedTransactionAmount;
    });

    await transactionRepository.save(transactions);
  }
}

export default Charge;
