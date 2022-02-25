const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';

const MS_NAME = process.env.MS_NAME || 'microservice-name';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_ENABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_ENABLE_REMOTE_MIDDLEWARE ?? 1);

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_WORKERS,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
};
