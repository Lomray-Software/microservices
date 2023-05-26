import { Stripe } from 'stripe';
import IFees from '@interfaces/fees';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  webhookKey?: string;
  payoutCoeff?: number;
  fees?: IFees;
  paymentMethods?: string[];
  apiKey?: string;
  config?: Stripe.StripeConfig;
}
