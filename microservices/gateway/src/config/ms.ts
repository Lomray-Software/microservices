import { Log } from '@lomray/microservice-helpers';
import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import { ConsoleLogDriver } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';
import {
  MS_BATCH_LIMIT,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_CORS_CONFIG,
  MS_INFO_ROUTE,
  MS_LISTENER_PORT,
  MS_NAME,
  MS_REQ_TIMEOUT,
} from '@constants/index';
import { version } from '../../package.json';

/**
 * Microservice options
 */
const msOptions: Partial<IGatewayOptions> = {
  name: MS_NAME,
  connection: MS_CONNECTION,
  isSRV: MS_CONNECTION_SRV,
  batchLimit: MS_BATCH_LIMIT,
  infoRoute: MS_INFO_ROUTE,
  reqTimeout: MS_REQ_TIMEOUT,
  listener: `0.0.0.0:${MS_LISTENER_PORT}`,
  version,
};

/**
 * Microservice params
 */
const msParams: Partial<IGatewayParams> = {
  beforeRoute: (express) => {
    express.use(cors(MS_CORS_CONFIG));
  },
  logDriver: ConsoleLogDriver((_, message) => Log.info(message)),
};

export { msOptions, msParams };
