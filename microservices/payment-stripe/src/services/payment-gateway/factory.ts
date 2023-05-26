import type { EntityManager } from 'typeorm';
import remoteConfig from '@config/remote';
import Stripe from './stripe';

/**
 * Payment gateway factory
 */
class Factory {
  /**
   * Create gateway instance
   */
  public static async create(manager: EntityManager): Promise<Stripe> {
    const { paymentConfig, paymentMethods, paymentApiKey } = await remoteConfig();

    if (!paymentConfig || !paymentApiKey || !paymentMethods) {
      throw new Error(`Payment options or api key or payment methods for stripe are not provided`);
    }

    return new Stripe(manager, paymentApiKey, paymentConfig, paymentMethods);
  }
}

export default Factory;
