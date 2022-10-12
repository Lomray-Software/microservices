import type { IStartConfig } from '@lomray/microservice-helpers';
import { msOptions, msParams } from '@config/ms';
import {
  MS_CONSOLE_LOG_LEVEL,
  MS_ENABLE_GRAFANA_LOG,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_GRAFANA_LOKI_CONFIG,
} from '@constants/index';
import registerMethods from '@methods/index';

const startConfig: IStartConfig = {
  type: 'microservice',
  msOptions,
  msParams,
  registerMethods,
  logGrafana: MS_GRAFANA_LOKI_CONFIG || Boolean(MS_ENABLE_GRAFANA_LOG),
  logConsoleLevel: MS_CONSOLE_LOG_LEVEL,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
};

export default startConfig;
