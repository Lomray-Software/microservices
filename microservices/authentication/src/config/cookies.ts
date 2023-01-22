import CONST from '@constants/index';

/**
 * Cookies config
 */
const cookies = {
  httpOnly: CONST.IS_HTTPONLY_COOKIE,
  secure: CONST.IS_SECURE_COOKIE,
  sameSite: CONST.COOKIE_SAME_SITE,
  domain: CONST.COOKIE_DOMAIN,
};

export default cookies;
