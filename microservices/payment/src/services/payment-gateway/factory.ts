import remoteConfig from '@config/remote';
import PaymentProvider from '@constants/payment-provider';
import Abstract from './abstract';
import Stripe from './stripe';

/**
 * Payment gateway factory
 */
class Factory {
  /**
   * Create gateway instance
   */
  public static async create(): Promise<Abstract> {
    const { paymentProvider, paymentOptions } = await remoteConfig();

    switch (paymentProvider) {
      case PaymentProvider.STRIPE:
        return new Stripe(paymentProvider, paymentOptions);

      default:
        throw new Error(`Unknown gateway provider: ${paymentProvider!}`);
    }
  }
}

export default Factory;
