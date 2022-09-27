import {
  COOKIE_DOMAIN,
  COOKIE_SAME_SITE,
  IS_HTTPONLY_COOKIE,
  IS_SECURE_COOKIE,
} from '@constants/index';

/**
 * Cookies config
 */
const cookies = {
  httpOnly: IS_HTTPONLY_COOKIE,
  secure: IS_SECURE_COOKIE,
  sameSite: COOKIE_SAME_SITE,
  domain: COOKIE_DOMAIN,
};

export default cookies;
