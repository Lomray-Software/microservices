import { Stripe } from 'stripe';
import IFees from '@interfaces/fees';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  webhookKeys?: {
    [id: string]: string; // id (unique key) - secret (webhook Signing secret)
  };
  payoutCoeff?: number;
  fees?: IFees;
  paymentMethods?: string[];
  apiKey?: string;
  config?: Stripe.StripeConfig;
}
