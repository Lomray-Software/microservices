import GetConstants from '@lomray/microservice-helpers/helpers/get-constants';
import { version, name } from '../../package.json';

const isBuild = process.env.__IS_BUILD__;
const msNameDefault = 'authentication';

const MS_JWT_PARAMS = JSON.parse(process.env.MS_JWT_PARAMS || '{}');
const MS_JWT_SECRET_KEY = process.env.MS_JWT_SECRET_KEY || undefined;
const IS_SECURE_COOKIE = Boolean(Number(process.env.IS_SECURE_COOKIE || 1));
const IS_HTTPONLY_COOKIE = Boolean(Number(process.env.IS_HTTPONLY_COOKIE || 1));
const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE || undefined) as undefined;
const COOKIE_DOMAIN = (process.env.COOKIE_DOMAIN || undefined) as undefined;

const constants = {
  ...GetConstants({ msNameDefault, version, isBuild, packageName: name, withDb: true }),
  MS_JWT_PARAMS,
  MS_JWT_SECRET_KEY,
  IS_SECURE_COOKIE,
  COOKIE_SAME_SITE,
  COOKIE_DOMAIN,
  IS_HTTPONLY_COOKIE,
};

export default constants;
