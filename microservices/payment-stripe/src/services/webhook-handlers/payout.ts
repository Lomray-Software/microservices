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
   * Handle payout create
   */
  public async handlePayoutCreate(event: StripeSdk.Event): Promise<void> {
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

      const payoutEntity = payoutRepository.create({
        amount,
        arrivalDate: new Date(Number(arrivalDate) * 1000),
        method: method as PayoutMethod,
        payoutId,
        description,
        destination: extractIdFromStripeInstance(destination),
        failureCode,
        failureMessage,
        currency,
        type: Parser.parseStripePayoutType(type as StripePayoutType),
        status: Parser.parseStripePayoutStatus(status as StripePayoutStatus),
      });

      await payoutRepository.save(payoutEntity);
    });
  }
}

export default Payout;
