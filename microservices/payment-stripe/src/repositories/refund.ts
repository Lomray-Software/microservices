import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager, EntityRepository, Repository } from 'typeorm';
import RefundStatus from '@constants/refund-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import RefundEntity from '@entities/refund';
import TransactionEntity from '@entities/transaction';
import messages from '@helpers/validators/messages';

/**
 * Refund repository
 */
@EntityRepository(RefundEntity)
class Refund extends Repository<RefundEntity> {
  /**
   * Update transactions refund status
   * @description Will cause transaction update
   */
  public static async updateTransactionsRefundStatus(
    transactionId: string,
    manager: EntityManager,
    // Refunded charge amount
    chargeRefundedAmount?: number | null,
  ): Promise<void> {
    const transactionRepository = manager.getRepository(TransactionEntity);
    const refundRepository = manager.getRepository(RefundEntity);

    // Get transaction and refunds
    const where = {
      transactionId,
    };

    const [refunds, transactions] = await Promise.all([
      refundRepository.find({ where }),
      transactionRepository.find({ where }),
    ]);
    const totalTransactionAmount = transactions.find(({ type }) => type === TransactionType.CREDIT)
      ?.amount;

    if (!transactions.length || !totalTransactionAmount) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to update transaction status on updated refund. Debit or credit transaction',
        ),
      });
    }

    /**
     * Pure refunded amount based on refunds, not charge refunded amount
     * @description If refund failed - charge will contain refunded amount that will not be refunded
     */
    const failedRefundedAmount = refunds.reduce((res, { amount, status }) => {
      if (status !== RefundStatus.ERROR) {
        return res;
      }

      return res + amount;
    }, 0);

    // Update transactions status
    transactions.forEach((transaction) => {
      // Get updated or existing refunded amount
      const refundedAmount = chargeRefundedAmount ?? transaction.params.refundedTransactionAmount;

      // Calculate real refunded amount
      transaction.params.successRefundedAmount = refundedAmount - failedRefundedAmount;

      // Update refunded amount if it occurs in charge
      if (chargeRefundedAmount) {
        transaction.params.refundedTransactionAmount = chargeRefundedAmount;
      }

      // If refund failed - status should be failed refund
      if (failedRefundedAmount) {
        transaction.status = TransactionStatus.REFUND_FAILED;

        return;
      }

      // If refunded amount is 0
      if (!refundedAmount) {
        return;
      }

      transaction.status =
        refundedAmount === totalTransactionAmount
          ? TransactionStatus.REFUNDED
          : TransactionStatus.PARTIAL_REFUNDED;
    });

    await transactionRepository.save(transactions);
  }
}

export default Refund;
