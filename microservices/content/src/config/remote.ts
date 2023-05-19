import { RemoteConfig } from '@lomray/microservice-helpers';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) } as Required<IRemoteConfig>;
};

export default remoteConfig;
