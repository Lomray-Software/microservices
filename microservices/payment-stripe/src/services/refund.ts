import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import RefundEntity from '@entities/refund';

class Refund {
  /**
   * Handle after create
   */
  public static async handleAfterCreate(entity: RefundEntity): Promise<void> {
    await Microservice.eventPublish(Event.RefundCreated, entity);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(entity: RefundEntity): Promise<void> {
    await Microservice.eventPublish(Event.RefundUpdated, entity);
  }
}

export default Refund;
