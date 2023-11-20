import { Microservice } from '@lomray/microservice-nodejs-lib';
import Event from '@lomray/microservices-client-api/constants/events/payment-stripe';
import TransactionEntity from '@entities/transaction';

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
  public static async handleAfterUpdate(entity: TransactionEntity): Promise<void> {
    await Microservice.eventPublish(Event.TransactionUpdated, entity);
  }
}

export default Transaction;
