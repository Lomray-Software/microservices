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
    const { config, paymentMethods, apiKey, fees, taxes } = await remoteConfig();

    // All environments are required
    const isFeesDefined = Boolean(
      fees?.stablePaymentUnit &&
        fees?.stableDisputeFeeUnit &&
        fees?.paymentPercent &&
        fees?.instantPayoutPercent,
    );
    const isTaxesDefined = Boolean(
      taxes?.autoCalculateFeeUnit && taxes?.stableUnit && taxes?.defaultPercent,
    );

    if (!config || !apiKey || !paymentMethods || !isFeesDefined || !isTaxesDefined) {
      throw new Error('Payment options or api key or payment methods for stripe are not provided');
    }

    return new Stripe(manager, apiKey, config, paymentMethods);
  }
}

export default Factory;
