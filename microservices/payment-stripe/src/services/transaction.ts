import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import ChargeRefundStatus from '@constants/charge-refund-status';
import TransactionStatus from '@constants/transaction-status';
import TransactionType from '@constants/transaction-type';
import TransactionEntity from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';

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
    await this.updateChargeRefundStatus(entity, manager);

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
   * Update charge refund status
   */
  private static async updateChargeRefundStatus(
    {
      type,
      amount,
      transactionId,
      chargeRefundStatus,
      params: { refundedTransactionAmount },
    }: TransactionEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (type !== TransactionType.DEBIT) {
      return;
    }

    const transactionRepository = manager.getRepository(TransactionEntity);
    let status: ChargeRefundStatus | null = null;

    if (refundedTransactionAmount === amount) {
      status = ChargeRefundStatus.FULL_REFUND;
    } else if (refundedTransactionAmount > 0) {
      status = ChargeRefundStatus.PARTIAL_REFUND;
    } else {
      status = ChargeRefundStatus.NO_REFUND;
    }

    if (!status || status === chargeRefundStatus) {
      return;
    }

    const transactions = await transactionRepository.find({
      where: {
        transactionId,
      },
    });

    transactions.forEach((transaction) => {
      transaction.chargeRefundStatus = status as ChargeRefundStatus;
    });

    await transactionRepository.save(transactions);
  }
}

export default Transaction;
