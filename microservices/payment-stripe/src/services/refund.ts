import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import { EntityManager } from 'typeorm';
import RefundEntity from '@entities/refund';
import RefundRepository from '@repositories/refund';

/**
 * Refund service
 */
class Refund {
  /**
   * Handle after create
   */
  public static async handleAfterCreate(
    entity: RefundEntity,
    manager: EntityManager,
  ): Promise<void> {
    await Promise.all([
      RefundRepository.updateTransactionsRefundStatus(entity.transactionId, manager),
      Microservice.eventPublish(Event.RefundCreated, entity),
    ]);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(
    entity: RefundEntity,
    manager: EntityManager,
  ): Promise<void> {
    await Promise.all([
      RefundRepository.updateTransactionsRefundStatus(entity.transactionId, manager),
      Microservice.eventPublish(Event.RefundUpdated, entity),
    ]);
  }
}

export default Refund;
