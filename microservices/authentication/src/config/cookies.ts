import { CookieOptions } from 'express-serve-static-core';
import remote from '@config/remote';

export interface ICookiesConfig {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: CookieOptions['sameSite'];
  domain?: string;
}

/**
 * Cookies config
 */
const cookies = async (): Promise<CookieOptions> => {
  const remoteConfig = await remote();

  return { ...remoteConfig.cookieOptions };
};

export default cookies;
