import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  corsOptions: CONST.MS_CORS_CONFIG,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) } as Required<IRemoteConfig>;
};

export default remoteConfig;
