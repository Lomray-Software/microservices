import { BaseException } from '@lomray/microservice-nodejs-lib';
import StripeSdk from 'stripe';
import { EntityManager, Repository } from 'typeorm';
import TransactionEntity from '@entities/transaction';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';

/**
 * Application fee webhook handlers
 */
class ApplicationFee {
  /**
   * @private
   */
  private readonly manager: EntityManager;

  /**
   * @private
   */
  private readonly transactionRepository: Repository<TransactionEntity>;

  /**
   * @constructor
   */
  public constructor(manager: EntityManager) {
    this.manager = manager;
    this.transactionRepository = manager.getRepository(TransactionEntity);
  }

  /**
   * Handles application fee refund updated
   */
  public async handleApplicationFeeRefundUpdated(
    event: StripeSdk.Event,
    sdk: StripeSdk,
  ): Promise<void> {
    const { fee } = event.data.object as StripeSdk.FeeRefund;

    const applicationFeeId = extractIdFromStripeInstance(fee);
    const transactions = await this.transactionRepository.find({
      applicationFeeId,
    });

    if (!transactions.length) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to update refunded application fees. Debit or credit transaction',
        ),
        payload: { eventName: event.type, applicationFeeId },
      });
    }

    const { amount, amount_refunded: refundedApplicationFeeAmount } =
      await sdk.applicationFees.retrieve(applicationFeeId);

    /**
     * @TODO: create helper for updates check
     */
    let isUpdated = false;

    transactions.forEach((transaction) => {
      if (transaction.fee !== amount) {
        throw new BaseException({
          status: 500,
          message: `Handle webhook event "${event.type}" occur. Transaction fee is not equal to Stripe application fee`,
          payload: { eventName: event.type, transactionFee: transaction.fee, feeAmount: amount },
        });
      }

      if (transaction.params.refundedApplicationFeeAmount !== refundedApplicationFeeAmount) {
        transaction.params.refundedApplicationFeeAmount = refundedApplicationFeeAmount;
        isUpdated = true;
      }
    });

    if (!isUpdated) {
      return;
    }

    await this.transactionRepository.save(transactions);
  }

  /**
   * Handles application fee refunded
   */
  public async handleApplicationFeeRefunded(event: StripeSdk.Event): Promise<void> {
    const {
      id: applicationFeeId,
      amount,
      amount_refunded: refundedApplicationFeeAmount,
    } = event.data.object as StripeSdk.ApplicationFee;

    const transactions = await this.transactionRepository.find({
      applicationFeeId,
    });

    if (!transactions.length) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage(
          'Failed to update refunded application fees. Debit or credit transaction',
        ),
        payload: { eventName: event.type, applicationFeeId },
      });
    }

    let isUpdated = false;

    /**
     * @TODO: move out to separate helper (e.g. class calculation)
     */
    transactions.forEach((transaction) => {
      if (transaction.fee !== amount) {
        throw new BaseException({
          status: 500,
          message: `Handle webhook event "${event.type}" occur. Transaction fee is not equal to Stripe application fee`,
          payload: { eventName: event.type, transactionFee: transaction.fee, feeAmount: amount },
        });
      }

      if (transaction.params.refundedApplicationFeeAmount !== refundedApplicationFeeAmount) {
        transaction.params.refundedApplicationFeeAmount = refundedApplicationFeeAmount;
        isUpdated = true;
      }
    });

    if (!isUpdated) {
      return;
    }

    await this.transactionRepository.save(transactions);
  }
}

export default ApplicationFee;
