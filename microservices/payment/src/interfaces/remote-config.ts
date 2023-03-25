import PaymentProvider from '@constants/payment-provider';
import TPaymentOptions from '@interfaces/payment-options';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  paymentProvider?: PaymentProvider;
  paymentOptions?: TPaymentOptions;
}
