import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  storageType: CONST.MS_STORAGE_TYPE as IRemoteConfig['storageType'],
  imageProcessingConfig: CONST.IMAGE_PROCESSING_CONFIG,
  storagePathPrefix: CONST.STORAGE_PATH_PREFIX,
  storageDomain: CONST.MS_STORAGE_DOMAIN,
  localStoragePath: CONST.LOCAL_STORAGE_PATH,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<IRemoteConfig> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) };
};

export default remoteConfig;
