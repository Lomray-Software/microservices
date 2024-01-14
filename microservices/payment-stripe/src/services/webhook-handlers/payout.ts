import type StripeSdk from 'stripe';
import { EntityManager } from 'typeorm';
import PayoutMethod from '@constants/payout-method';
import StripePayoutStatus from '@constants/stripe/payout-status';
import StripePayoutType from '@constants/stripe/payout-type';
import PayoutEntity from '@entities/payout';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import Parser from '@services/parser';

/**
 * Payout webhook handlers
 */
class Payout {
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
   * Handle payout occur
   * @description Payout can be created or updated
   */
  public async handlePayoutOccur(event: StripeSdk.Event): Promise<void> {
    const {
      id: payoutId,
      amount,
      description,
      method,
      type,
      destination,
      arrival_date: arrivalDate,
      status,
      failure_code: failureCode,
      failure_message: failureMessage,
      currency,
      created,
    } = event.data.object as StripeSdk.Payout;

    const data = {
      type: Parser.parseStripePayoutType(type as StripePayoutType),
      arrivalDate: new Date(Number(arrivalDate) * 1000),
      registeredAt: new Date(Number(created) * 1000),
      status: Parser.parseStripePayoutStatus(status as StripePayoutStatus),
      method: method as PayoutMethod,
      ...(destination ? { destination: extractIdFromStripeInstance(destination) } : {}),
    };

    // Add deps in transaction
    await this.manager.transaction(async (entityManager) => {
      const payoutRepository = entityManager.getRepository(PayoutEntity);

      const payout = await payoutRepository.findOne({
        where: {
          payoutId,
        },
      });

      if (!payout) {
        const payoutEntity = payoutRepository.create({
          amount,
          arrivalDate: data.arrivalDate,
          method: data.method,
          payoutId,
          description,
          failureCode,
          failureMessage,
          currency,
          type: data.type,
          status: data.status,
          registeredAt: data.registeredAt,
          ...(data.destination ? { destination: data.destination } : {}),
        });

        await payoutRepository.save(payoutEntity);

        return;
      }

      // Do not update payout if event: created
      if (event.type === 'payout.created') {
        return;
      }

      if (data.destination) {
        payout.destination = data.destination;
      }

      payout.amount = amount;
      payout.arrivalDate = data.arrivalDate;
      payout.method = data.method;
      payout.description = description;
      payout.failureMessage = failureMessage;
      payout.failureCode = failureCode;
      payout.currency = currency;
      payout.type = data.type;
      payout.status = data.status;
      payout.registeredAt = data.registeredAt;

      await payoutRepository.save(payout);
    });
  }
}

export default Payout;
