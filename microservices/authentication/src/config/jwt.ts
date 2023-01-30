import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';
import type { IJwtParams } from '@services/tokens/jwt';

export interface IJwtConfig extends IJwtParams {
  secretKey: string;
}

const jwtOptions = { ...CONST.MS_JWT_PARAMS, secretKey: CONST.MS_JWT_SECRET_KEY };

/**
 * Get JWT options
 */
const jwt = async (): Promise<IJwtConfig> => {
  const remoteConfig = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...jwtOptions, ...(remoteConfig?.jwtOptions ?? {}) };
};

export default jwt;
