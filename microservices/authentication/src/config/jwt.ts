import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IJwtParams } from '@services/tokens/jwt';

export interface IJwtConfig extends IJwtParams {
  secretKey: string;
}

const jwtOptions = { ...CONST.MS_JWT_PARAMS, secretKey: CONST.MS_JWT_SECRET_KEY };

/**
 * Get JWT options
 */
const jwt = async (withRemote = CONST.IS_REMOTE_CONFIG_ENABLE): Promise<IJwtConfig> => {
  if (withRemote) {
    const remoteConfig = await RemoteConfig.get<{ jwtOptions?: IJwtConfig }>('config');

    return { ...jwtOptions, ...(remoteConfig?.jwtOptions ?? {}) };
  }

  return jwtOptions;
};

export default jwt;
