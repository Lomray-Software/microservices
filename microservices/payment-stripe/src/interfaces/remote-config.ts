import { Stripe } from 'stripe';
import IFees from '@interfaces/fees';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  webhookKey?: string;
  payoutCoeff?: number;
  paymentFees?: IFees;
  paymentMethods?: string[];
  paymentApiKey?: string;
  paymentConfig?: Stripe.StripeConfig;
}
