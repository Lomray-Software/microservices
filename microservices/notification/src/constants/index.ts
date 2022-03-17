import EmailProvider from '@constants/email-provider';

const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';
const IS_BUILD = process.env.__IS_BUILD__;
const SRC_FOLDER = IS_BUILD ? 'lib' : 'src';

const MS_NAME = process.env.MS_NAME || 'notification';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_ENABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_ENABLE_REMOTE_MIDDLEWARE ?? 1);

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER ?? EmailProvider.SIMPLE;
const EMAIL_DEFAULT_FROM = process.env.EMAIL_DEFAULT_FROM ?? undefined;
const EMAIL_FROM_CONFIG_MS = Number(process.env.EMAIL_FROM_CONFIG_MS ?? 1);
const EMAIL_TRANSPORTER_OPTIONS = process.env.EMAIL_FROM_CONFIG_MS || '{}';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const AWS_REGION = process.env.AWS_REGION || '';

const DB_FROM_CONFIG_MS = Number(process.env.DB_FROM_CONFIG_MS ?? 1);
const DB_ENV = {
  URL: process.env.DB_URL || undefined,
  HOST: process.env.DB_HOST || '127.0.0.1',
  PORT: Number(process.env.DB_PORT) || 5432,
  USERNAME: process.env.DB_USERNAME || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'example',
  DATABASE: process.env.DB_DATABASE || 'ms-notification',
};

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_WORKERS,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  DB_FROM_CONFIG_MS,
  DB_ENV,
  EMAIL_PROVIDER,
  EMAIL_DEFAULT_FROM,
  EMAIL_FROM_CONFIG_MS,
  EMAIL_TRANSPORTER_OPTIONS,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
  IS_BUILD,
  SRC_FOLDER,
};
