import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  paymentMethods: CONST.MS_PAYMENT_METHODS,
  apiKey: CONST.MS_API_KEY,
  config: CONST.MS_CONFIG,
  webhookKey: CONST.MS_WEBHOOK_KEY,
  payoutCoeff: CONST.MS_PAYOUT_COEFF,
  fees: JSON.parse(CONST.MS_FEES),
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;