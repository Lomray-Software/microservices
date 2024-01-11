import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import PayoutEntity from '@entities/payout';

/**
 * Payout service
 */
class Payout {
  /**
   * Handles after insert event
   */
  public static async handleAfterInsert(entity: PayoutEntity): Promise<void> {
    await Microservice.eventPublish(Event.PayoutCreated, entity);
  }

  /**
   * Handles after update event
   */
  public static async handleAfterUpdate(entity: PayoutEntity): Promise<void> {
    await Microservice.eventPublish(Event.PayoutUpdated, entity);
  }
}

export default Payout;
