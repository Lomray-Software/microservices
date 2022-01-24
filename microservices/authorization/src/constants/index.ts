const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';

const MS_NAME = process.env.MS_NAME || 'authorization';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_DISABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_DISABLE_REMOTE_MIDDLEWARE) || 0;
const MS_REMOTE_CONFIG = Number(process.env.MS_REMOTE_CONFIG || 1);
const MS_DEFAULT_ROLE_ALIAS = process.env.MS_DEFAULT_ROLE_ALIAS || 'user';

const DB_FROM_CONFIG_MS = Number(process.env.DB_FROM_CONFIG_MS ?? 1);
const DB_ENV = {
  HOST: process.env.DB_HOST || '127.0.0.1',
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USERNAME || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'example',
  DATABASE: process.env.DB_DATABASE || 'ms-authorization',
};

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_WORKERS,
  MS_DISABLE_REMOTE_MIDDLEWARE,
  DB_FROM_CONFIG_MS,
  DB_ENV,
  MS_REMOTE_CONFIG,
  MS_DEFAULT_ROLE_ALIAS,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
};
