const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const IS_DEV = ENV === 'development';
const IS_TEST = ENV === 'tests';
const IS_BUILD = process.env.__IS_BUILD__;
const BRANCH = process.env.__BRANCH__;
const SRC_FOLDER = IS_BUILD ? 'lib' : 'src';

const MS_NAME = process.env.MS_NAME || 'microservice-name';
const MS_CONFIG_NAME = process.env.MS_CONFIG_NAME || 'configuration';
const MS_CONNECTION = process.env.MS_CONNECTION || undefined;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MS_CONNECTION_SRV = Boolean(process.env.MS_CONNECTION_SRV) || false;
const MS_WORKERS = Number(process.env.MS_WORKERS) || undefined;
const MS_ENABLE_REMOTE_MIDDLEWARE = Number(process.env.MS_ENABLE_REMOTE_MIDDLEWARE ?? 1);
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
  MS_WORKERS,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  ENV,
  IS_PROD,
  IS_DEV,
  IS_TEST,
  IS_BUILD,
  BRANCH,
  SRC_FOLDER,
  MS_GRAFANA_LOKI_CONFIG,
  MS_ENABLE_GRAFANA_LOG,
  MS_OPENTELEMETRY_ENABLE,
  MS_OPENTELEMETRY_OTLP_URL,
  MS_OPENTELEMETRY_OTLP_URL_SRV,
  MS_OPENTELEMETRY_DEBUG,
  MS_CONSOLE_LOG_LEVEL,
};
