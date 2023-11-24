import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import TransactionStatus from '@constants/transaction-status';
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
}

export default Transaction;
