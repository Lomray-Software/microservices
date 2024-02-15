import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import RefundStatus from '@constants/refund-status';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import StripeRefundStatus from '@constants/stripe-refund-status';
import TransactionType from '@constants/transaction-type';
import DisputeEntity from '@entities/dispute';
import EvidenceDetailsEntity from '@entities/evidence-details';
import RefundEntity from '@entities/refund';
import TransactionEntity from '@entities/transaction';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';
import TCurrency from '@interfaces/currency';
import TRefundErrorReason from '@interfaces/refund-error-reason';
import IRefundMetadata from '@interfaces/refund-metadata';
import RefundRepository from '@repositories/refund';
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
  public async handleChargeRefunded(
    event: StripeSdk.Event,
    manager: EntityManager,
    sdk: StripeSdk,
  ): Promise<void> {
    const {
      status,
      payment_intent: paymentIntent,
      amount_refunded: refundedAmount,
      id,
    } = event.data.object as StripeSdk.Charge;

    if (!paymentIntent || !status) {
      throw new Error("Payment intent id or charge status wasn't provided.");
    }

    await manager.transaction(async (entityManager) => {
      // Sequence required
      await this.syncStripeRefunds(
        extractIdFromStripeInstance(paymentIntent),
        id,
        sdk,
        entityManager,
      );

      await RefundRepository.updateTransactionsRefundStatus(
        extractIdFromStripeInstance(paymentIntent),
        entityManager,
        refundedAmount,
      );
    });
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
      throw new Error("Dispute was not handled. Payment intent or dispute status wasn't provided.");
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
            issuedAt: new Date(Number(issuedAt) * 1000),
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
      throw new Error("Dispute was not handled. Payment intent or dispute status wasn't provided.");
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
        throw new Error(messages.getNotFoundMessage(`Dispute transaction "${transactionId}"`));
      }

      await DisputeService.update(disputeEntity, dispute, entityManager);
    });
  }

  /**
   * Handles refund updated
   */
  public async handleRefundUpdated(
    event: StripeSdk.Event,
    manager: EntityManager,
    sdk: StripeSdk,
  ): Promise<void> {
    const refundRepository = manager.getRepository(RefundEntity);
    const transactionRepository = manager.getRepository(TransactionEntity);
    const {
      id,
      status,
      reason,
      failure_reason: failedReason,
      payment_intent: paymentIntent,
      amount,
      metadata,
    } = event.data.object as StripeSdk.Refund;

    if (!paymentIntent || !status) {
      throw new Error("Payment intent id or refund status wasn't provided.");
    }

    const refund = await refundRepository
      .createQueryBuilder('r')
      .where("r.params ->> 'refundId' = :refundId", { refundId: id })
      .getOne();

    const refundStatus = Parser.parseStripeRefundStatus(status as StripeRefundStatus);

    if (!refund) {
      const transaction = await transactionRepository.findOne({
        where: {
          transactionId: extractIdFromStripeInstance(paymentIntent),
          type: TransactionType.DEBIT,
        },
      });

      if (!transaction) {
        throw new Error(
          messages.getNotFoundMessage('Dashboard refund was not registered. Transaction'),
        );
      }

      const refundEntity = refundRepository.create({
        transactionId: transaction.transactionId,
        amount,
        ...(refundStatus ? { status: refundStatus } : {}),
        ...(metadata?.entityId ? { entityId: metadata.entityId } : {}),
        params: {
          refundId: id,
          reason: reason as string,
          errorReason: failedReason as TRefundErrorReason,
        },
      });

      const savedRefund = await refundRepository.save(refundEntity);

      // Sync stripe refund with the microservice refund
      if (!metadata?.hasOwnProperty('refundId')) {
        await sdk.refunds.update(id, { metadata: { refundId: savedRefund.id } });
      }

      return;
    }

    if (!refundStatus) {
      throw new Error('Failed to get transaction status for refund.');
    }

    refund.status = refundStatus;
    refund.params.errorReason = failedReason as TRefundErrorReason;
    refund.params.refundId = id;
    refund.amount = amount;

    if (reason && refund.params.reason !== reason) {
      refund.params.reason = reason;
    }

    await refundRepository.save(refund);
  }

  /**
   * Sync Stripe refunds with the microservice refunds
   * @description Stripe does not automatically create refunds if first partial refund was successful.
   * Iterate from all existing refund and save refund that STRIPE DOES NOT SENT IN WEBHOOK
   * @private
   */
  private async syncStripeRefunds(
    transactionId: string,
    chargeId: string,
    sdk: StripeSdk,
    entityManager: EntityManager,
  ): Promise<void> {
    const refundRepository = entityManager.getRepository(RefundEntity);
    let refunds: StripeSdk.ApiList<StripeSdk.Refund>;
    let lastRefundTargetId: string | null = null;

    do {
      refunds = await sdk.refunds.list({
        charge: chargeId,
        limit: 10,
        // eslint-disable-next-line camelcase
        ...(lastRefundTargetId ? { starting_after: lastRefundTargetId } : {}),
      });
      lastRefundTargetId = refunds?.data?.[9]?.id;

      const existingRefunds = await refundRepository
        .createQueryBuilder('r')
        .where("r.params ->> 'refundId' IN (:...ids)", {
          ids: refunds.data.map(({ id: refundId }) => refundId),
        })
        .getMany();

      const notRegisteredRefunds = refunds.data.filter(
        (refund) => !existingRefunds.find(({ params }) => params.refundId === refund.id),
      );

      await Promise.all(
        notRegisteredRefunds.map(({ id, amount, status: refundStatus, metadata, reason }) => {
          const { entityId, type, refundAmountType } = metadata as IRefundMetadata;

          return refundRepository.save(
            refundRepository.create({
              transactionId: extractIdFromStripeInstance(transactionId),
              amount,
              status:
                Parser.parseStripeRefundStatus(refundStatus as StripeRefundStatus) ||
                RefundStatus.INITIAL,
              ...(entityId ? { entityId } : {}),
              params: {
                refundId: id,
                ...(reason ? { reason } : {}),
                ...(type ? { type } : {}),
                ...(refundAmountType ? { refundAmountType } : {}),
              },
            }),
          );
        }),
      );
    } while (refunds.has_more);
  }
}

export default Charge;
