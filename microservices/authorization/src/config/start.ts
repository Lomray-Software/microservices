import { IStartConfigWithDb } from '@lomray/microservice-helpers';
import dbOptions from '@config/db';
import { msOptions, msParams } from '@config/ms';
import {
  DB_FROM_CONFIG_MS,
  MS_CONSOLE_LOG_LEVEL,
  MS_ENABLE_GRAFANA_LOG,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_GRAFANA_LOKI_CONFIG,
} from '@constants/index';
import registerMethods from '@methods/index';

const startConfig: IStartConfigWithDb = {
  type: 'microservice',
  msOptions,
  msParams,
  dbOptions: dbOptions(),
  registerMethods,
  // for local run without configuration ms this should be set to false (or use RunConfiguration IDE)
  shouldUseDbRemoteOptions: Boolean(DB_FROM_CONFIG_MS),
  logGrafana: MS_GRAFANA_LOKI_CONFIG || Boolean(MS_ENABLE_GRAFANA_LOG),
  logConsoleLevel: MS_CONSOLE_LOG_LEVEL,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
};

export default startConfig;
