import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import TClearUserTokens from '@interfaces/clear-user-tokens';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  passwordSaltRounds: CONST.MS_USER_PASSWORD_SALT_ROUNDS,
  removedAccountRestoreTime: CONST.MS_USER_REMOVE_ACCOUNT_RESTORE_TIME,
  changePasswordClearTokensType:
    CONST.MS_USER_CHANGE_PASSWORD_CLEAR_TOKENS_TYPE as TClearUserTokens,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(conf ?? {}) } as Required<IRemoteConfig>;
};

export default remoteConfig;
