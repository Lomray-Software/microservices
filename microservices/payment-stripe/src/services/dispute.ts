import { Log } from '@lomray/microservice-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import DisputeStatus from '@constants/dispute-status';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import DisputeEntity from '@entities/dispute';
import TransactionEntity from '@entities/transaction';
import Parser from '@services/parser';

/**
 * Dispute
 */
class Dispute {
  /**
   * Update dispute entity by Stripe dispute
   */
  public static async update(
    disputeEntity: DisputeEntity,
    {
      evidence_details: evidenceDetails,
      amount,
      status,
      reason,
      is_charge_refundable: isChargeRefundable,
      metadata,
      balance_transactions: balanceTransactions,
    }: StripeSdk.Dispute,
    manager: EntityManager,
  ): Promise<void> {
    disputeEntity.amount = amount;
    disputeEntity.metadata = metadata;
    disputeEntity.params.balanceTransactionId = balanceTransactions?.[0]?.id;
    disputeEntity.params.isChargeRefundable = isChargeRefundable;
    disputeEntity.evidenceDetails.submissionCount = evidenceDetails.submission_count;
    disputeEntity.evidenceDetails.isPastBy = evidenceDetails.past_due;
    disputeEntity.evidenceDetails.hasEvidence = evidenceDetails.has_evidence;
    disputeEntity.reason = Parser.parseStripeDisputeReason(reason as StripeDisputeReason);

    const disputeStatus = Parser.parseStripeDisputeStatus(status as StripeDisputeStatus);

    // Stripe can send under review status after won or lost dispute
    if (![DisputeStatus.LOST, DisputeStatus.WON].includes(disputeEntity.status)) {
      disputeEntity.status = disputeStatus;
    }

    if (evidenceDetails.due_by) {
      disputeEntity.evidenceDetails.dueBy = new Date(evidenceDetails.due_by * 1000);
    }

    const { chargedFees, chargedAmount, netWorth } = Dispute.getChargedAmounts(balanceTransactions);

    disputeEntity.chargedFees = chargedFees;
    disputeEntity.chargedAmount = chargedAmount;
    disputeEntity.netWorth = netWorth;

    await manager.getRepository(DisputeEntity).save(disputeEntity);
    await Dispute.updateTransactionsDisputeStatus(
      manager,
      disputeEntity.transactionId,
      disputeStatus,
    );
  }

  /**
   * Returns total dispute charged amounts
   */
  public static getChargedAmounts(
    balanceTransactions: StripeSdk.BalanceTransaction[],
  ): Pick<DisputeEntity, 'chargedAmount' | 'chargedFees' | 'netWorth'> {
    return balanceTransactions.reduce(
      (acc, transaction) => {
        acc.chargedFees = (acc.chargedFees || 0) + transaction.fee;
        acc.chargedAmount = (acc.chargedAmount || 0) + transaction.amount;
        acc.netWorth = (acc.netWorth || 0) + transaction.net;

        return acc;
      },
      { chargedFees: 0, chargedAmount: 0, netWorth: 0 },
    );
  }

  /**
   * Handle after create
   */
  public static async handleAfterCreate(
    entity: DisputeEntity,
    manager: EntityManager,
  ): Promise<void> {
    await Promise.all([
      Dispute.updateTransactionsDisputeStatus(manager, entity.transactionId, entity.status),
      Microservice.eventPublish(Event.DisputeCreated, entity),
    ]);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(entity: DisputeEntity): Promise<void> {
    await Microservice.eventPublish(Event.DisputeUpdated, entity);
  }

  /**
   * Update transactions dispute status
   */
  private static async updateTransactionsDisputeStatus(
    manager: EntityManager,
    transactionId?: string | null,
    disputeStatus?: DisputeStatus | null,
  ): Promise<void> {
    if (!transactionId) {
      return;
    }

    const transactionRepository = manager.getRepository(TransactionEntity);

    const transactions = await transactionRepository.find({
      where: {
        transactionId,
      },
    });

    if (!transactions.length) {
      Log.error('Failed to update transaction dispute status. Transactions were not found.');

      return;
    }

    let isUpdated = false;
    const transactionDisputeStatus =
      Parser.parseStripeDisputeStatusToTransactionDisputeStatus(disputeStatus);

    transactions.forEach((transaction) => {
      if (transaction.disputeStatus === transactionDisputeStatus) {
        return;
      }

      transaction.disputeStatus = transactionDisputeStatus;
      isUpdated = true;
    });

    if (!isUpdated) {
      return;
    }

    await transactionRepository.save(transactions);
  }
}

export default Dispute;
