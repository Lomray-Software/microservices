import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import ChargeRefundStatus from '@constants/charge-refund-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import DisputeEntity from '@entities/dispute';
import TransactionEntity from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';

/**
 * Transaction service
 */
class Transaction {
  /**
   * Not succeeded transaction statuses
   */
  private static notSucceededTransactionStatuses: TransactionStatus[] = [
    TransactionStatus.INITIAL,
    TransactionStatus.IN_PROCESS,
    TransactionStatus.ERROR,
    TransactionStatus.EXPIRED,
  ];

  /**
   * Handle after create
   */
  public static async handleAfterCreate(entity: TransactionEntity): Promise<void> {
    await Microservice.eventPublish(Event.TransactionCreated, entity);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(
    entity: TransactionEntity,
    databaseEntity: TransactionEntity,
    manager: EntityManager,
    updateColumns: ColumnMetadata[],
  ): Promise<void> {
    await this.syncStats(entity, manager);

    if (this.notSucceededTransactionStatuses.includes(entity.status)) {
      await Microservice.eventPublish(Event.TransactionUpdated, entity);

      return;
    }

    const isChargeUpdated = updateColumns.some(({ propertyName }) => propertyName === 'chargeId');

    /**
     * Attach required to transactions Stripe references and amount
     */
    if (isChargeUpdated && entity.chargeId && !databaseEntity.chargeId) {
      await (await Factory.create(manager)).attachToTransactionsChargeRefs(entity.chargeId);
    }

    await Microservice.eventPublish(Event.TransactionUpdated, entity);
  }

  /**
   * Update transaction stats
   * @description Sync stats that can be missed due webhook events
   */
  private static async syncStats(
    { type, amount, transactionId, params: { refundedTransactionAmount } }: TransactionEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (type !== TransactionType.DEBIT) {
      return;
    }

    const transactionRepository = manager.getRepository(TransactionEntity);
    const disputeRepository = manager.getRepository(DisputeEntity);

    /**
     * Get transactions
     */
    const [transactions, disputeCount] = await Promise.all([
      transactionRepository.find({
        where: {
          transactionId,
        },
      }),
      disputeRepository.count({ where: { transactionId } }),
    ]);
    const isTransactionDisputed = Boolean(disputeCount);

    if (!transactions.length) {
      return;
    }

    const updatedChargeRefundStatus = this.getChargeRefundStatus(amount, refundedTransactionAmount);

    let isUpdated = false;
    let isListeners = false;

    transactions.forEach((transaction) => {
      // Sync charge refund status
      if (transaction.chargeRefundStatus !== updatedChargeRefundStatus) {
        transaction.chargeRefundStatus = updatedChargeRefundStatus;
        isUpdated = true;
      }

      // Sync dispute status
      if (!isTransactionDisputed || transaction.isDisputed === isTransactionDisputed) {
        return;
      }

      transaction.isDisputed = true;
      isUpdated = true;
      isListeners = true;
    });

    if (!isUpdated) {
      return;
    }

    await transactionRepository.save(transactions, { listeners: isListeners });
  }

  /**
   * Returns charge refund status
   */
  private static getChargeRefundStatus(
    amount: number,
    refundedTransactionAmount: number,
  ): ChargeRefundStatus {
    if (refundedTransactionAmount === amount) {
      return ChargeRefundStatus.FULL_REFUND;
    }

    if (refundedTransactionAmount > 0) {
      return ChargeRefundStatus.PARTIAL_REFUND;
    }

    return ChargeRefundStatus.NO_REFUND;
  }
}

export default Transaction;
