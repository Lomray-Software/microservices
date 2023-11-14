import type { Stripe } from 'stripe';
import type IFees from '@interfaces/fees';
import type ITaxes from '@interfaces/taxes';

export type TSetupIntentUsage = 'off_session' | 'on_session';

export type TDuplicatedCarsUsage = 'support' | 'reject';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  duplicatedCardsUsage: TDuplicatedCarsUsage;
  setupIntentUsage: TSetupIntentUsage;
  webhookKeys?: {
    [id: string]: string; // id (unique key) - secret (webhook Signing secret)
  };
  payoutCoeff?: number;
  fees?: IFees;
  taxes?: ITaxes;
  paymentMethods?: string[];
  apiKey?: string;
  config?: Stripe.StripeConfig;
}
