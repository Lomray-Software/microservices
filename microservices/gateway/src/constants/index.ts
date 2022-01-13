const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';

const MS_NAME = process.env.MS_NAME || 'gateway';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || undefined;
const MS_BATCH_LIMIT = Number(process.env.MS_BATCH_LIMIT) || undefined;
const MS_INFO_ROUTE = process.env.MS_INFO_ROUTE || undefined;
const MS_REQ_TIMEOUT = Number(process.env.MS_REQ_TIMEOUT) || undefined;
const MS_DISABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_DISABLE_REMOTE_MIDDLEWARE) || 0;

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_BATCH_LIMIT,
  MS_INFO_ROUTE,
  MS_REQ_TIMEOUT,
  MS_DISABLE_REMOTE_MIDDLEWARE,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
};
