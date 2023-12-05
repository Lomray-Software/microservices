import { Log } from '@lomray/microservice-helpers';
import { BaseException } from '@lomray/microservice-nodejs-lib';
import toSmallestUnit from '@lomray/microservices-client-api/helpers/parsers/to-smallest-unit';
import StripeSdk from 'stripe';
import { EntityManager, Repository } from 'typeorm';
import StripeTransactionStatus from '@constants/stripe-transaction-status';
import TransactionType from '@constants/transaction-type';
import Card from '@entities/card';
import TransactionEntity from '@entities/transaction';
import extractIdFromStripeInstance from '@helpers/extract-id-from-stripe-instance';
import messages from '@helpers/validators/messages';
import type { IPaymentIntentMetadata } from '@interfaces/payment-intent-metadata';
import CardRepository from '@repositories/card';
import Parser from '@services/parser';

/**
 * Payment intent webhook handlers
 */
class PaymentIntent {
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
   * Handles payment intent statuses
   */
  public async handlePaymentIntent(event: StripeSdk.Event, sdk: StripeSdk): Promise<void> {
    const {
      id,
      status,
      latest_charge: latestCharge,
      last_payment_error: lastPaymentError,
      transfer_data: transferData,
    } = event.data.object as StripeSdk.PaymentIntent;

    await this.manager.transaction(async (entityManager) => {
      const transactionRepository = entityManager.getRepository(TransactionEntity);

      const transactions = await transactionRepository.find({ transactionId: id });

      if (!transactions.length) {
        const errorMessage = messages.getNotFoundMessage(
          `Failed to handle payment intent "${event.type}". Debit or credit transaction`,
        );

        Log.error(errorMessage);

        throw new BaseException({
          status: 500,
          message: errorMessage,
          payload: { eventName: event.type },
        });
      }

      // Sonar warning
      const { transactionId, taxCalculationId } = transactions?.[0] || {};

      let stripeTaxTransaction: StripeSdk.Tax.Transaction | null = null;

      /**
       * If tax collecting and payment intent succeeded - create tax transaction
       * @description Create tax transaction cost is $0.5. Create only if payment intent succeeded
       */
      if (taxCalculationId && status === StripeTransactionStatus.SUCCEEDED) {
        // Create tax transaction (for Stripe Tax reports)
        stripeTaxTransaction = await sdk.tax.transactions.createFromCalculation({
          calculation: taxCalculationId,
          // Stripe payment intent id
          reference: transactionId,
        });
      }

      transactions.forEach((transaction) => {
        transaction.status = Parser.parseStripeTransactionStatus(status as StripeTransactionStatus);

        /**
         * Attach related charge
         */
        if (!transaction.chargeId && latestCharge) {
          transaction.chargeId = extractIdFromStripeInstance(latestCharge);
        }

        /**
         * Attach destination funds transfer connect account
         */
        if (!transaction.params.transferDestinationConnectAccountId && transferData?.destination) {
          transaction.params.transferDestinationConnectAccountId = extractIdFromStripeInstance(
            transferData.destination,
          );
        }

        /**
         * Attach tax transaction if reference
         */
        if (stripeTaxTransaction) {
          transaction.taxTransactionId = stripeTaxTransaction.id;
        }

        if (!lastPaymentError) {
          return;
        }

        /**
         * Attach error data if it occurs
         */
        transaction.params.errorMessage = lastPaymentError.message;
        transaction.params.errorCode = lastPaymentError.code;
        transaction.params.declineCode = lastPaymentError.decline_code;
      });

      if (stripeTaxTransaction) {
        /**
         * Sync payment intent with the microservice transactions
         */
        await sdk.paymentIntents.update(transactionId, {
          metadata: {
            taxTransactionId: stripeTaxTransaction?.id,
          },
        });
      }

      await transactionRepository.save(transactions);
    });
  }

  /**
   * Handles payment intent failure creation
   * @description Payment intent will be created with the failed status: card was declined -
   * high fraud risk but stripe will throw error on creation and send webhook event with the creation
   */
  public async handlePaymentIntentPaymentFailed(
    event: StripeSdk.Event,
    sdk: StripeSdk,
  ): Promise<void> {
    const {
      id,
      status,
      metadata,
      amount,
      latest_charge: latestCharge,
      last_payment_error: lastPaymentError,
    } = event.data.object as StripeSdk.PaymentIntent;

    await this.manager.transaction(async (entityManager) => {
      const transactionRepository = entityManager.getRepository(TransactionEntity);

      const transactions = await transactionRepository.find({ transactionId: id });

      /**
       * If transactions weren't created cause payment intent failed on create
       */
      if (transactions.length) {
        return;
      }

      const {
        entityId,
        title,
        feesPayer,
        cardId,
        entityCost,
        senderId,
        receiverId,
        taxExpiresAt,
        taxCreatedAt,
        taxBehaviour,
        receiverRevenue,
        taxAutoCalculateFee,
        taxFee,
        taxTransactionId,
        taxCalculationId,
      } = metadata as unknown as IPaymentIntentMetadata;

      const card = await entityManager
        .getRepository(Card)
        .createQueryBuilder('card')
        .where('card.userId = :userId AND card.id = :cardId', { userId: senderId, cardId })
        .getOne();

      if (!card) {
        throw new BaseException({
          status: 500,
          message: messages.getNotFoundMessage('Failed to create transaction. Card'),
        });
      }

      /* eslint-enable camelcase */
      const transactionData = {
        entityId,
        title,
        paymentMethodId: CardRepository.extractPaymentMethodId(card),
        cardId,
        transactionId: id,
        status: Parser.parseStripeTransactionStatus(status as StripeTransactionStatus),
        ...(latestCharge ? { chargeId: extractIdFromStripeInstance(latestCharge) } : {}),
        ...(taxTransactionId ? { taxTransactionId } : {}),
        ...(taxCalculationId ? { taxCalculationId } : {}),
        // eslint-disable-next-line camelcase
        params: {
          feesPayer,
          entityCost: toSmallestUnit(entityCost),
          errorCode: lastPaymentError?.code,
          errorMessage: lastPaymentError?.message,
          declineCode: lastPaymentError?.decline_code,
          taxExpiresAt,
          taxCreatedAt,
          taxBehaviour,
          // Only if calculation was created provide tax calculation fee
          ...(taxCalculationId && taxAutoCalculateFee
            ? { taxAutoCalculateFee: toSmallestUnit(taxAutoCalculateFee) }
            : {}),
          // Only if tax transaction was created provide tax fee
          ...(taxTransactionId && taxFee ? { taxFee: toSmallestUnit(taxFee) } : {}),
        },
      };

      await Promise.all([
        transactionRepository.save(
          transactionRepository.create({
            ...transactionData,
            userId: senderId,
            type: TransactionType.CREDIT,
            amount,
            params: transactionData.params,
          }),
        ),
        transactionRepository.save(
          transactionRepository.create({
            ...transactionData,
            userId: receiverId,
            type: TransactionType.DEBIT,
            amount: toSmallestUnit(receiverRevenue),
            params: transactionData.params,
          }),
        ),
      ]);

      // Do not support update payment intent, only recharge via creating new payment
      if (status !== StripeTransactionStatus.REQUIRES_PAYMENT_METHOD) {
        return;
      }

      await sdk.paymentIntents.cancel(id);
    });
  }
}

export default PaymentIntent;
