import { Log } from '@lomray/microservice-helpers';
import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import { ConsoleLogDriver, LogType } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';
import _ from 'lodash';
import RequestIp from 'request-ip';
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
    const corsConfig = MS_CORS_CONFIG;

    // Check origin's and find regex
    if (Array.isArray(corsConfig.origin)) {
      corsConfig.origin = corsConfig.origin.map((origin: string) =>
        // if string is regex, convert to regex instance
        origin.startsWith('/') ? new RegExp(origin.replace(/^\/|\/$/g, '')) : origin,
      );
    }

    express.use(cors(corsConfig));
    express.use((req, res, next) => {
      const clientIp = RequestIp.getClientIp(req);

      // parse user info
      try {
        const userInfo = req.header('user-info');

        if (userInfo) {
          _.set(req.headers, 'user-info', JSON.parse(userInfo));
        }
      } catch (e) {
        Log.error('Failed parse user info', e);
      }

      // set user ip
      if (clientIp) {
        _.set(req.headers, 'user-info.ipAddress', clientIp);
      }

      next();
    });
  },
  logDriver: ConsoleLogDriver((message, { type }) =>
    Log.log(type === LogType.ERROR ? 'error' : 'info', message),
  ),
};

export { msOptions, msParams };
