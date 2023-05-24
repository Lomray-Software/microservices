import type PaymentProvider from '@constants/payment-provider';
import IFees from '@interfaces/fees';
import type TPaymentOptions from '@interfaces/payment-options';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  paymentProvider?: PaymentProvider;
  paymentOptions?: TPaymentOptions;
  paymentWebhookKey?: string;
  payoutCoeff?: number;
  paymentFees?: IFees;
}
