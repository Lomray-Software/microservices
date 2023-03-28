import type PaymentProvider from '@constants/payment-provider';
import type TPaymentOptions from '@interfaces/payment-options';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  paymentProvider?: PaymentProvider;
  paymentOptions?: TPaymentOptions;
}
