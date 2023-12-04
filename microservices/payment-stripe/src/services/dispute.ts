import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import DisputeEntity from '@entities/dispute';

/**
 * Dispute
 */
class Dispute {
  /**
   * Handle after create
   */
  public static async handleAfterCreate(entity: DisputeEntity): Promise<void> {
    await Microservice.eventPublish(Event.DisputeCreated, entity);
  }

  /**
   * Handle after update
   */
  public static async handleAfterUpdate(entity: DisputeEntity): Promise<void> {
    await Microservice.eventPublish(Event.DisputeUpdated, entity);
  }
}

export default Dispute;
