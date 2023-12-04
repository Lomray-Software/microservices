import Charge from './charge';
import Customer from './customer';

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
   * @constructor
   * @TODO: provide manager
   */
  private constructor() {
    this.customer = new Customer();
    this.charge = new Charge();
  }

  /**
   * Init service
   */
  public static init(): WebhookHandlers {
    return new WebhookHandlers();
  }
}

export default WebhookHandlers;
