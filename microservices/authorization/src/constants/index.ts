const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';
const IS_BUILD = process.env.__IS_BUILD__;
const SRC_FOLDER = IS_BUILD ? 'lib' : 'src';

const MS_NAME = process.env.MS_NAME || 'authorization';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || 5;
const MS_ENABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_ENABLE_REMOTE_MIDDLEWARE ?? 1);
const MS_REMOTE_CONFIG = Number(process.env.MS_REMOTE_CONFIG || 1);
const MS_DEFAULT_ROLE_ALIAS = process.env.MS_DEFAULT_ROLE_ALIAS || 'user';
const MS_DEFAULT_PERMISSION_MIGRATION = Number(process.env.MS_DEFAULT_PERMISSION_MIGRATION || 0);
const MS_GRAFANA_LOKI_CONFIG = JSON.parse(process.env.MS_GRAFANA_LOKI_CONFIG || 'null');
const MS_ENABLE_GRAFANA_LOG = Number(process.env.MS_ENABLE_GRAFANA_LOG || 0);
const MS_OPENTELEMETRY_ENABLE = Number(process.env.MS_OPENTELEMETRY_ENABLE || 0);
const MS_OPENTELEMETRY_OTLP_URL = process.env.MS_OPENTELEMETRY_OTLP_URL || undefined;
const MS_OPENTELEMETRY_OTLP_URL_SRV = Number(process.env.MS_OPENTELEMETRY_OTLP_URL_SRV || 0);
const MS_OPENTELEMETRY_DEBUG = Number(process.env.MS_OPENTELEMETRY_DEBUG || 0);
const MS_CONSOLE_LOG_LEVEL = process.env.MS_CONSOLE_LOG_LEVEL || 'info';

const DB_FROM_CONFIG_MS = Number(process.env.DB_FROM_CONFIG_MS ?? 1);
const DB_ENV = {
  URL: process.env.DB_URL || undefined,
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
  MS_ENABLE_REMOTE_MIDDLEWARE,
  DB_FROM_CONFIG_MS,
  DB_ENV,
  MS_REMOTE_CONFIG,
  MS_DEFAULT_ROLE_ALIAS,
  MS_DEFAULT_PERMISSION_MIGRATION,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
  IS_BUILD,
  SRC_FOLDER,
  MS_GRAFANA_LOKI_CONFIG,
  MS_ENABLE_GRAFANA_LOG,
  MS_OPENTELEMETRY_ENABLE,
  MS_OPENTELEMETRY_OTLP_URL,
  MS_OPENTELEMETRY_OTLP_URL_SRV,
  MS_OPENTELEMETRY_DEBUG,
  MS_CONSOLE_LOG_LEVEL,
};
