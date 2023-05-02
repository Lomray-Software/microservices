import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  corsOptions: CONST.MS_CORS_CONFIG,
  webhookOptions: {
    url: CONST.MS_WEBHOOK_URL,
    allowMethods: CONST.MS_WEBHOOK_ALLOW_METHODS,
  },
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  const webhookOptions = { ...defaultConfig.webhookOptions, ...(conf?.webhookOptions ?? {}) };

  return { ...defaultConfig, ...(conf ?? {}), webhookOptions } as Required<IRemoteConfig>;
};

export default remoteConfig;
