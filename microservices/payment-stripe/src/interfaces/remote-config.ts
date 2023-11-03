import type { Stripe } from 'stripe';
import type IFees from '@interfaces/fees';
import type ITaxes from '@interfaces/taxes';

export type TSetupIntentUsage = 'off_session' | 'on_session';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  webhookKeys?: {
    [id: string]: string; // id (unique key) - secret (webhook Signing secret)
  };
  payoutCoeff?: number;
  fees?: IFees;
  taxes?: ITaxes;
  paymentMethods?: string[];
  apiKey?: string;
  config?: Stripe.StripeConfig;
  setupIntentUsage?: TSetupIntentUsage;
}
