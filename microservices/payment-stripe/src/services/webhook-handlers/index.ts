import Charge from './charge';
import Customer from './customer';
import Dispute from './dispute';

/**
 * Webhook handlers
 * @description Webhook handlers for Stripe events
 * Each service related to event object that it represents
 * @example event.object is Dispute, so Dispute service should handle it, event if route is charge.dispute.created
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
   * @public
   */
  public readonly charge: Charge;

  /**
   * @constructor
   * @TODO: provide manager
   */
  private constructor() {
    this.customer = new Customer();
    this.dispute = new Dispute();
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
