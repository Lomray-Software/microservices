import type { EntityManager } from 'typeorm';
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
  public static async create(manager: EntityManager): Promise<Abstract> {
    const { paymentProvider, paymentOptions } = await remoteConfig();

    switch (paymentProvider) {
      case PaymentProvider.STRIPE:
        if (!paymentOptions) {
          throw new Error(`Payment options for stripe are not provided`);
        }

        return new Stripe(manager, paymentProvider, paymentOptions);
      default:
        throw new Error(`Unknown gateway provider: ${paymentProvider!}`);
    }
  }
}

export default Factory;
