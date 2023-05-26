import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  paymentMethods: CONST.PAYMENT_METHODS,
  paymentApiKey: CONST.PAYMENT_API_KEY,
  paymentConfig: CONST.PAYMENT_CONFIG,
  webhookKey: CONST.WEBHOOK_KEY,
  payoutCoeff: CONST.PAYOUT_COEFF,
  paymentFees: JSON.parse(CONST.PAYMENT_FEES),
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;
