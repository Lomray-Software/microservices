import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import StripeRefundStatus from '@constants/stripe-refund-status';
import TransactionStatus from '@constants/transaction-status';
import DisputeEntity from '@entities/dispute';
import EvidenceDetailsEntity from '@entities/evidence-details';
import RefundEntity from '@entities/refund';
import TransactionEntity from '@entities/transaction';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';
import TCurrency from '@interfaces/currency';
import DisputeService from '@services/dispute';
import Parser from '@services/parser';

/**
 * Charge webhook handler
 */
class Charge {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
  }

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

  /**
   * Handles charge dispute created
   * @description Should create microservice dispute and related evidence details
   */
  public async handleChargeDisputeCreated(
    event: StripeSdk.Event,
    manager: EntityManager,
  ): Promise<void> {
    const {
      id,
      evidence_details: evidenceDetails,
      currency,
      amount,
      payment_intent: paymentIntent,
      status,
      reason,
      is_charge_refundable: isChargeRefundable,
      created: issuedAt,
      metadata,
      balance_transactions: balanceTransactions,
    } = event.data.object as StripeSdk.Dispute;

    if (!paymentIntent || !status) {
      throw new BaseException({
        status: 500,
        message: "Dispute was not handled. Payment intent or dispute status wasn't provided.",
      });
    }

    await manager.transaction(async (entityManager) => {
      const disputeRepository = entityManager.getRepository(DisputeEntity);
      const evidenceDetailsRepository = entityManager.getRepository(EvidenceDetailsEntity);

      /**
       * Get transactions by payment intent id
       * @description Stripe send events in parallel, so at this moment transactions may not exist in db
       */
      const transactionId = extractIdFromStripeInstance(paymentIntent);
      const { chargedAmount, chargedFees, netWorth } =
        DisputeService.getChargedAmounts(balanceTransactions);

      const disputeEntity = await disputeRepository.save(
        disputeRepository.create({
          disputeId: id,
          amount,
          transactionId,
          status: Parser.parseStripeDisputeStatus(status as StripeDisputeStatus),
          reason: Parser.parseStripeDisputeReason(reason as StripeDisputeReason),
          metadata,
          chargedAmount,
          chargedFees,
          netWorth,
          params: {
            issuedAt: new Date(Number(issuedAt)),
            currency: currency as TCurrency,
            isChargeRefundable,
          },
        }),
      );

      await evidenceDetailsRepository.save(
        evidenceDetailsRepository.create({
          disputeId: disputeEntity.id,
          isPastBy: evidenceDetails.past_due,
          submissionCount: evidenceDetails.submission_count,
          hasEvidence: evidenceDetails.has_evidence,
          ...(evidenceDetails.due_by ? { dueBy: new Date(evidenceDetails.due_by * 1000) } : {}),
        }),
      );
    });
  }

  /**
   * Handles charge dispute updated
   */
  public async handleChargeDisputeUpdated(
    event: StripeSdk.Event,
    manager: EntityManager,
  ): Promise<void> {
    const dispute = event.data.object as StripeSdk.Dispute;

    if (!dispute?.payment_intent || !dispute.status) {
      throw new BaseException({
        status: 500,
        message: "Dispute was not handled. Payment intent or dispute status wasn't provided.",
        payload: { eventName: event.type },
      });
    }

    await manager.transaction(async (entityManager) => {
      const disputeRepository = entityManager.getRepository(DisputeEntity);
      const transactionId = extractIdFromStripeInstance(
        dispute.payment_intent as string | StripeSdk.PaymentIntent,
      );

      const disputeEntity = await disputeRepository.findOne({
        relations: ['evidenceDetails'],
        where: {
          transactionId,
        },
      });

      if (!disputeEntity) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Dispute was not updated. Dispute'),
          payload: {
            transactionId,
            eventName: event.type,
          },
        });
      }

      await DisputeService.update(disputeEntity, dispute, entityManager);
    });
  }

  /**
   * Handles refund updated
   */
  public async handleRefundUpdated(event: StripeSdk.Event, manager: EntityManager): Promise<void> {
    const refundRepository = manager.getRepository(RefundEntity);
    const {
      id,
      status,
      reason,
      failure_reason: failedReason,
      payment_intent: paymentIntent,
    } = event.data.object as StripeSdk.Refund;

    if (!paymentIntent || !status) {
      throw new BaseException({
        status: 500,
        message: "Payment intent id or refund status wasn't provided.",
      });
    }

    const refund = await refundRepository
      .createQueryBuilder('r')
      .where("r.params ->> 'refundId' = :refundId", { refundId: id })
      .getOne();

    if (!refund) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Failed to update refund. Refund'),
      });
    }

    const refundStatus = Parser.parseStripeRefundStatus(status as StripeRefundStatus);

    if (!refundStatus) {
      throw new BaseException({
        status: 500,
        message: 'Failed to get transaction status for refund.',
      });
    }

    refund.status = refundStatus;
    refund.params.errorReason = failedReason;

    if (reason && refund.params.reason !== reason) {
      refund.params.reason = reason;
    }

    await refundRepository.save(refund);
  }
}

export default Charge;
