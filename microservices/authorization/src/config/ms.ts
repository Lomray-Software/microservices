import { Log } from '@lomray/microservice-helpers';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import { ConsoleLogDriver } from '@lomray/microservice-nodejs-lib';
import { MS_CONNECTION, MS_NAME, MS_CONNECTION_SRV, MS_WORKERS } from '@constants/index';
import { version } from '../../package.json';

/**
 * Microservice options
 */
const msOptions: Partial<IMicroserviceOptions> = {
  name: MS_NAME,
  connection: MS_CONNECTION,
  isSRV: MS_CONNECTION_SRV,
  workers: MS_WORKERS,
  version,
};

/**
 * Microservice params
 */
const msParams: Partial<IMicroserviceParams> = {
  logDriver: ConsoleLogDriver((_, message) => Log.info(message)),
};

export { msOptions, msParams };
