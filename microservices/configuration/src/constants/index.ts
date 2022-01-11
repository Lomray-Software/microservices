const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';

const MS_NAME = process.env.MS_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_DISABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_DISABLE_REMOTE_MIDDLEWARE) || 0;
const MS_CONFIGS = process.env.MS_CONNECTION || '[]';

const DB_ENV = {
  HOST: process.env.DB_HOST || '127.0.0.1',
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USERNAME || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'example',
  DATABASE: process.env.DB_DATABASE || 'ms-configuration',
};

export {
  MS_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_WORKERS,
  DB_ENV,
  MS_DISABLE_REMOTE_MIDDLEWARE,
  MS_CONFIGS,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
};
