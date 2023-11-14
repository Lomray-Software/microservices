import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  paymentMethods: CONST.MS_PAYMENT_METHODS,
  setupIntentUsage: CONST.SETUP_INTENT_USAGE,
  apiKey: CONST.MS_API_KEY,
  config: CONST.MS_CONFIG,
  webhookKeys: CONST.MS_WEBHOOK_KEYS,
  payoutCoeff: CONST.MS_PAYOUT_COEFF,
  fees: JSON.parse(CONST.MS_FEES),
  taxes: JSON.parse(CONST.MS_TAXES),
  duplicatedCardsUsage: CONST.DUPLICATED_CARDS_USAGE,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;
