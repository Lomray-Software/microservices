import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  passwordSaltRounds: CONST.MS_USER_PASSWORD_SALT_ROUNDS,
  removedAccountRestoreTimeInDays: CONST.MS_USER_REMOVE_ACCOUNT_RESTORE_TIME_IN_DAYS,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) } as Required<IRemoteConfig>;
};

export default remoteConfig;
