import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import cors from 'cors';
import { MS_BATCH_LIMIT, MS_CONNECTION, MS_NAME } from '@constants/index';
import { version } from '../../package.json';

const microserviceOptions: Partial<IGatewayOptions> = {
  name: MS_NAME,
  connection: MS_CONNECTION,
  batchLimit: MS_BATCH_LIMIT,
  version,
};

const microserviceParams: Partial<IGatewayParams> = {
  beforeRoute: (express) => {
    express.use(
      cors({
        exposedHeaders: ['Guest-Id', 'Jwt-Access-Token', 'Jwt-Refresh-Token'],
      }),
    );
  },
};

export { microserviceOptions, microserviceParams };
