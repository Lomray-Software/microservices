import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  paymentMethods: CONST.PAYMENT_METHODS,
  apiKey: CONST.API_KEY,
  config: CONST.CONFIG,
  webhookKey: CONST.WEBHOOK_KEY,
  payoutCoeff: CONST.PAYOUT_COEFF,
  fees: JSON.parse(CONST.FEES),
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;
