const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';

const MS_NAME = process.env.MS_NAME || 'authentication';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV ?? false);
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_DISABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_DISABLE_REMOTE_MIDDLEWARE ?? 0);
const MS_JWT_PARAMS = JSON.parse(process.env.MS_JWT_PARAMS || '{}');
const MS_JWT_SECRET_KEY = process.env.MS_JWT_SECRET_KEY || undefined;
const MS_REMOTE_CONFIG = Number(process.env.MS_REMOTE_CONFIG || 1);

const DB_FROM_CONFIG_MS = Number(process.env.DB_FROM_CONFIG_MS ?? 1);
const DB_ENV = {
  HOST: process.env.DB_HOST || '127.0.0.1',
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USERNAME || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'example',
  DATABASE: process.env.DB_DATABASE || 'ms-authentication',
};

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_WORKERS,
  MS_DISABLE_REMOTE_MIDDLEWARE,
  MS_JWT_PARAMS,
  MS_JWT_SECRET_KEY,
  MS_REMOTE_CONFIG,
  DB_ENV,
  DB_FROM_CONFIG_MS,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
};
