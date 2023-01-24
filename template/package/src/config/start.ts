import { GetDbConfig, GetMsStartConfig } from '@lomray/microservice-helpers';
import defaultStartConfig from '@lomray/microservice-name/config/start';
import CONST from '@constants/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  ...defaultStartConfig,
  dbOptions: GetDbConfig(CONST, CONST.EXTEND_PACKAGE_NAME),
});

export default startConfig;
