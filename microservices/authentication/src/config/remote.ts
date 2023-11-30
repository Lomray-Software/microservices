import { RemoteConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

const defaultConfig: IRemoteConfig = {
  jwtOptions: { ...CONST.MS_JWT_PARAMS, secretKey: CONST.MS_JWT_SECRET_KEY },
  cookieOptions: {
    httpOnly: CONST.IS_HTTPONLY_COOKIE,
    secure: CONST.IS_SECURE_COOKIE,
    sameSite: CONST.COOKIE_SAME_SITE,
    domain: CONST.COOKIE_DOMAIN,
  },
  cookieStrategy: CONST.COOKIE_AUTH_STRATEGY,
};

/**
 * Get remote config
 */
const remoteConfig = async (): Promise<Required<IRemoteConfig>> => {
  const conf = await RemoteConfig.get<IRemoteConfig>('config');
  const cookieOptions = { ...defaultConfig.cookieOptions, ...(conf?.cookieOptions ?? {}) };
  const jwtOptions = { ...defaultConfig.jwtOptions, ...(conf?.jwtOptions ?? {}) };

  return {
    ...defaultConfig,
    ...(conf ?? {}),
    cookieOptions,
    jwtOptions,
  } as Required<IRemoteConfig>;
};

export default remoteConfig;
