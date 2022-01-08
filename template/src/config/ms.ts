import { Log } from '@lomray/microservice-helpers';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import { ConsoleLogDriver } from '@lomray/microservice-nodejs-lib';
import { MS_CONNECTION, MS_NAME } from '@constants/index';
import { version } from '../../package.json';

const microserviceOptions: Partial<IMicroserviceOptions> = {
  name: MS_NAME,
  connection: MS_CONNECTION,
  version,
};

const microserviceParams: Partial<IMicroserviceParams> = {
  logDriver: ConsoleLogDriver((_, message) => Log.info(message)),
};

export { microserviceOptions, microserviceParams };
