import { start } from '@lomray/microservice-helpers';
import { msOptions, msParams } from '@config/ms';
import {
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_ENABLE_GRAFANA_LOG,
  MS_GRAFANA_LOKI_CONFIG,
  MS_CONSOLE_LOG_LEVEL,
} from '@constants/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default start({
  type: 'gateway',
  msOptions,
  msParams,
  logGrafana: MS_GRAFANA_LOKI_CONFIG || Boolean(MS_ENABLE_GRAFANA_LOG),
  logConsoleLevel: MS_CONSOLE_LOG_LEVEL,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
