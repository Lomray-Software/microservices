import { EntityManager } from 'typeorm';
import ApplicationFee from './application-fee';
import Charge from './charge';
import Customer from './customer';
import PaymentIntent from './payment-intent';

/**
 * Webhook handlers
 * @description Webhook handlers for Stripe events
 * @example charge.dispute.created - services should be charge
 */
class WebhookHandlers {
  /**
   * @public
   */
  public readonly customer: Customer;

  /**
   * @public
   */
  public readonly charge: Charge;

  /**
   * @public
   */
  public readonly applicationFee: ApplicationFee;

  /**
   * @public
   */
  public readonly paymentIntent: PaymentIntent;

  /**
   * @constructor
   */
  private constructor(manager: EntityManager) {
    this.customer = new Customer(manager);
    this.charge = new Charge(manager);
    this.applicationFee = new ApplicationFee(manager);
    this.paymentIntent = new PaymentIntent(manager);
  }

  /**
   * Init service
   */
  public static init(manager: EntityManager): WebhookHandlers {
    return new WebhookHandlers(manager);
  }
}

export default WebhookHandlers;
