import Customer from './customer';
import Dispute from './dispute';

/**
 * Webhook handlers
 * @description Webhook handlers for Stripe events
 * Decomposed logic from payment stripe service
 */
class WebhookHandlers {
  /**
   * @public
   */
  public readonly customer: Customer;

  /**
   * @public
   */
  public readonly dispute: Dispute;

  /**
   * @constructor
   */
  private constructor() {
    this.customer = new Customer();
    this.dispute = new Dispute();
  }

  /**
   * Init service
   */
  public static init(): WebhookHandlers {
    return new WebhookHandlers();
  }
}

export default WebhookHandlers;
