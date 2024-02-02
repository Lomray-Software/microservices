import type TClearUserTokens from '@interfaces/clear-user-tokens';

/**
 * Microservice remote config
 */
export interface IRemoteConfig {
  passwordSaltRounds?: number;
  removedAccountRestoreTime?: number;
  changePasswordClearTokensType?: TClearUserTokens;
}
