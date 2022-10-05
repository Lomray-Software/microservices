import { Log } from '@lomray/microservice-helpers';
import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import { ConsoleLogDriver, LogType } from '@lomray/microservice-nodejs-lib';
import {
  MS_BATCH_LIMIT,
  MS_CONNECTION,
  MS_CONNECTION_SRV,
  MS_INFO_ROUTE,
  MS_JSON_LIMIT,
  MS_LISTENER_PORT,
  MS_NAME,
  MS_REQ_TIMEOUT,
} from '@constants/index';
import cors from '@middlewares/cors';
import userInfo from '@middlewares/user-info';
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
  jsonParams: {
    limit: `${MS_JSON_LIMIT}mb`,
  },
};

const msMiddlewares = [cors, userInfo];

/**
 * Microservice params
 */
const msParams: Partial<IGatewayParams> = {
  beforeRoute: (express) => {
    msMiddlewares.forEach((middleware) => express.use(middleware()));
  },
  logDriver: ConsoleLogDriver((message, { type }) =>
    Log.log(type === LogType.ERROR ? 'error' : 'info', message),
  ),
};

export { msOptions, msParams, msMiddlewares };
