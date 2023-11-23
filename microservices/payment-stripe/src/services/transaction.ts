import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import TransactionEntity from '@entities/transaction';
import Factory from '@services/payment-gateway/factory';

class Transaction {
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
