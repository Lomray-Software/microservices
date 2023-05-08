import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import PaymentProvider from '@constants/payment-provider';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  paymentProvider: CONST.PAYMENT_PROVIDER as PaymentProvider,
  paymentOptions: JSON.parse(CONST.PAYMENT_OPTIONS),
  paymentWebhookKey: CONST.PAYMENT_WEBHOOK_KEY,
  payoutCoeff: CONST.PAYOUT_COEFF,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;
