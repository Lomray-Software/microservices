import { BaseException } from '@lomray/microservice-nodejs-lib';
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
    } = event.data.object as StripeSdk.Payout;

    if (!destination) {
      throw new BaseException({
        status: 500,
        message: 'Failed to register payout, expected destination.',
      });
    }

    // Add deps in transaction
    await this.manager.transaction(async (entityManager) => {
      const payoutRepository = entityManager.getRepository(PayoutEntity);

      const payout = await payoutRepository.findOne({
        where: {
          payoutId,
        },
      });

      const data = {
        type: Parser.parseStripePayoutType(type as StripePayoutType),
        arrivalDate: new Date(Number(arrivalDate) * 1000),
        status: Parser.parseStripePayoutStatus(status as StripePayoutStatus),
        destination: extractIdFromStripeInstance(destination),
        method: method as PayoutMethod,
      };

      if (!payout) {
        const payoutEntity = payoutRepository.create({
          amount,
          arrivalDate: data.arrivalDate,
          method: data.method,
          payoutId,
          description,
          destination: data.destination,
          failureCode,
          failureMessage,
          currency,
          type: data.type,
          status: data.status,
        });

        await payoutRepository.save(payoutEntity);

        return;
      }

      if (event.type === 'payout.created') {
        return;
      }

      payout.amount = amount;
      payout.arrivalDate = data.arrivalDate;
      payout.method = data.method;
      payout.description = description;
      payout.destination = data.destination;
      payout.failureMessage = failureMessage;
      payout.failureCode = failureCode;
      payout.currency = currency;
      payout.type = data.type;
      payout.status = data.status;

      await payoutRepository.save(payout);
    });
  }
}

export default Payout;
