import remote from '@config/remote';
import type { IJwtParams } from '@services/tokens/jwt';

export interface IJwtConfig extends IJwtParams {
  secretKey: string;
}

/**
 * Get JWT options
 */
const jwt = async (audience: string[] = []): Promise<IJwtConfig> => {
  const remoteConfig = await remote();
  const result: IJwtConfig = { ...remoteConfig.jwtOptions };

  if (audience.length) {
    result.options = {
      ...(result.options ?? {}),
      audience: [...(result.options?.audience ?? []), ...audience],
    };
  }

  return result;
};

export default jwt;
