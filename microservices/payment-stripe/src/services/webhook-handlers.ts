import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import StripeDisputeReason from '@constants/stripe-dispute-reason';
import StripeDisputeStatus from '@constants/stripe-dispute-status';
import CustomerEntity from '@entities/customer';
import Dispute from '@entities/dispute';
import EvidenceDetails from '@entities/evidence-details';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';
import TCurrency from '@interfaces/currency';
import CardRepository from '@repositories/card';
import DisputeService from '@services/dispute';
import Parser from '@services/parser';

/**
 * Webhook handlers
 * @description Webhook handlers for Stripe events
 * Decomposed logic from payment stripe service
 */
class WebhookHandlers {
  /**
   * Handles charge dispute created
   * @description Should create microservice dispute and related evidence details
   */
  public static async handleChargeDisputeCreated(
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
      const disputeRepository = entityManager.getRepository(Dispute);
      const evidenceDetailsRepository = entityManager.getRepository(EvidenceDetails);

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
  public static async handleChargeDisputeUpdated(
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
      const disputeRepository = entityManager.getRepository(Dispute);
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
   * Handles customer update
   */
  public static async handleCustomerUpdated(
    event: StripeSdk.Event,
    manager: EntityManager, // Required if manger is transaction manager
  ): Promise<void> {
    await manager.transaction(async (entityManager) => {
      const customerRepository = entityManager.getRepository(CustomerEntity);
      const cardRepository = entityManager.getCustomRepository(CardRepository);
      const { id, invoice_settings: invoiceSettings } = event.data.object as StripeSdk.Customer;

      /**
       * @TODO: Investigate why relations return empty array
       */
      const customer = await customerRepository.findOne({ customerId: id });

      if (!customer) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Customer'),
        });
      }

      const cards = await cardRepository.find({
        userId: customer.userId,
      });

      /**
       * Update cards default statuses on change default card for charge
       */

      await Promise.all(
        cards.map((card) => {
          card.isDefault =
            CardRepository.extractPaymentMethodId(card) === invoiceSettings.default_payment_method;

          return cardRepository.save(card);
        }),
      );

      /**
       * If customer has default payment method, and it's exist in stripe
       */
      if (customer.params.hasDefaultPaymentMethod && invoiceSettings.default_payment_method) {
        return;
      }

      customer.params.hasDefaultPaymentMethod = Boolean(invoiceSettings.default_payment_method);

      await customerRepository.save(customer);
    });
  }
}

export default WebhookHandlers;
