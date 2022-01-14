import { RemoteConfig } from '@lomray/microservice-helpers';
import { MS_JWT_PARAMS, MS_JWT_SECRET_KEY, MS_REMOTE_CONFIG } from '@constants/index';
import type { IJwtParams } from '@services/tokens/jwt';

export interface IJwtConfig extends IJwtParams {
  secretKey: string;
}

const jwtOptions = { ...MS_JWT_PARAMS, secretKey: MS_JWT_SECRET_KEY };

/**
 * Get JWT options
 */
const jwt = async (withRemote = MS_REMOTE_CONFIG): Promise<IJwtConfig> => {
  if (withRemote) {
    const remoteConfig = await RemoteConfig.get<{ jwtOptions?: IJwtConfig }>('config');

    return { ...jwtOptions, ...(remoteConfig?.jwtOptions ?? {}) };
  }

  return jwtOptions;
};

export default jwt;
