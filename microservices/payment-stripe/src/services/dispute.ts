import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import DisputeEntity from '@entities/dispute';
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
    disputeEntity.status = Parser.parseStripeDisputeStatus(status as StripeDisputeStatus);
    disputeEntity.reason = Parser.parseStripeDisputeReason(reason as StripeDisputeReason);
    disputeEntity.metadata = metadata;
    disputeEntity.params.balanceTransactionId = balanceTransactions?.[0]?.id;
    disputeEntity.params.isChargeRefundable = isChargeRefundable;
    disputeEntity.evidenceDetails.submissionCount = evidenceDetails.submission_count;
    disputeEntity.evidenceDetails.isPastBy = evidenceDetails.past_due;
    disputeEntity.evidenceDetails.hasEvidence = evidenceDetails.has_evidence;

    if (evidenceDetails.due_by) {
      disputeEntity.evidenceDetails.dueBy = new Date(evidenceDetails.due_by * 1000);
    }

    const { chargedFees, chargedAmount, netWorth } = Dispute.getChargedAmounts(balanceTransactions);

    disputeEntity.chargedFees = chargedFees;
    disputeEntity.chargedAmount = chargedAmount;
    disputeEntity.netWorth = netWorth;

    await manager.getRepository(DisputeEntity).save(disputeEntity);
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
  public static async handleAfterCreate(entity: DisputeEntity): Promise<void> {
    await Microservice.eventPublish(Event.DisputeCreated, entity);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(entity: DisputeEntity): Promise<void> {
    await Microservice.eventPublish(Event.DisputeUpdated, entity);
  }
}

export default Dispute;
