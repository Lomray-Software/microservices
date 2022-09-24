const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';
const IS_BUILD = process.env.__IS_BUILD__;
const SRC_FOLDER = IS_BUILD ? 'lib' : 'src';

const MS_NAME = process.env.MS_NAME || 'gateway';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || undefined;
const MS_BATCH_LIMIT = Number(process.env.MS_BATCH_LIMIT) || undefined;
const MS_INFO_ROUTE = process.env.MS_INFO_ROUTE || undefined;
const MS_REQ_TIMEOUT = Number(process.env.MS_REQ_TIMEOUT) || undefined;
const MS_JSON_LIMIT = Number(process.env.MS_JSON_LIMIT ?? 30);
const MS_ENABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_ENABLE_REMOTE_MIDDLEWARE ?? 1);
const MS_LISTENER_PORT = process.env.MS_LISTENER_PORT || 3000;
const MS_CORS_CONFIG = JSON.parse(
  process.env.MS_CORS_CONFIG || '{"origin":["http://localhost:3000"],"credentials":true}',
);
const MS_GRAFANA_LOKI_CONFIG = JSON.parse(process.env.MS_GRAFANA_LOKI_CONFIG || 'null');
const MS_ENABLE_GRAFANA_LOG = Number(process.env.MS_ENABLE_GRAFANA_LOG || 0);
const MS_OPENTELEMETRY_ENABLE = Number(process.env.MS_OPENTELEMETRY_ENABLE || 0);
const MS_OPENTELEMETRY_OTLP_URL = process.env.MS_OPENTELEMETRY_OTLP_URL || undefined;
const MS_OPENTELEMETRY_OTLP_URL_SRV = Number(process.env.MS_OPENTELEMETRY_OTLP_URL_SRV || 0);
const MS_OPENTELEMETRY_DEBUG = Number(process.env.MS_OPENTELEMETRY_DEBUG || 0);
const MS_CONSOLE_LOG_LEVEL = process.env.MS_CONSOLE_LOG_LEVEL || 'info';

export {
  MS_NAME,
  MS_CONFIG_NAME,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_BATCH_LIMIT,
  MS_INFO_ROUTE,
  MS_REQ_TIMEOUT,
  MS_JSON_LIMIT,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_LISTENER_PORT,
  MS_CORS_CONFIG,
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
