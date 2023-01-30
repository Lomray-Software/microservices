import { RemoteConfig } from '@lomray/microservice-helpers';
import { CookieOptions } from 'express-serve-static-core';
import CONST from '@constants/index';
import type { IRemoteConfig } from '@interfaces/remote-config';

export interface ICookiesConfig {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: CookieOptions['sameSite'];
  domain?: string;
}

const defaultConfig = {
  httpOnly: CONST.IS_HTTPONLY_COOKIE,
  secure: CONST.IS_SECURE_COOKIE,
  sameSite: CONST.COOKIE_SAME_SITE,
  domain: CONST.COOKIE_DOMAIN,
};

/**
 * Cookies config
 */
const cookies = async (): Promise<CookieOptions> => {
  const remoteConfig = await RemoteConfig.get<IRemoteConfig>('config');

  return { ...defaultConfig, ...(remoteConfig?.cookieOptions ?? {}) };
};

export default cookies;
