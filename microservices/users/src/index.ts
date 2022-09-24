import { startWithDb } from '@lomray/microservice-helpers';
import dbOptions from '@config/db';
import { msOptions, msParams } from '@config/ms';
import {
  DB_FROM_CONFIG_MS,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_ENABLE_GRAFANA_LOG,
  MS_GRAFANA_LOKI_CONFIG,
  ENABLE_EVENTS,
  MS_CONSOLE_LOG_LEVEL,
} from '@constants/index';
import registerEvents from '@events/index';
import registerMethods from '@methods/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default startWithDb({
  type: 'microservice',
  msOptions,
  msParams,
  dbOptions,
  registerMethods,
  registerEvents: ENABLE_EVENTS ? registerEvents : undefined,
  // for local run without configuration ms this should be set to false (or use RunConfiguration IDE)
  shouldUseDbRemoteOptions: Boolean(DB_FROM_CONFIG_MS),
  logGrafana: MS_GRAFANA_LOKI_CONFIG || Boolean(MS_ENABLE_GRAFANA_LOG),
  logConsoleLevel: MS_CONSOLE_LOG_LEVEL,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
