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
const jwt = async (audience: string[] = []): Promise<IJwtConfig> => {
  const remoteConfig = await RemoteConfig.get<IRemoteConfig>('config');

  const result: IJwtConfig = { ...jwtOptions, ...(remoteConfig?.jwtOptions ?? {}) };

  if (audience.length) {
    result.options = {
      ...(result.options ?? {}),
      audience: [...(result.options?.audience ?? []), ...audience],
    };
  }

  return result;
};

export default jwt;
