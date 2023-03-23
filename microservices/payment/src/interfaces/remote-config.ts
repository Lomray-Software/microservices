import PaymentProvider from '@constants/payment-provider';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  paymentProvider?: PaymentProvider;
  paymentOptions?: Record<string, any>;
}
