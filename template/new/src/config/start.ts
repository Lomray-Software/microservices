import {
  // GetDbConfig,
  GetMsOptions,
  GetMsParams,
  GetMsStartConfig,
} from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
  msOptions: GetMsOptions(CONST),
  msParams: GetMsParams(),
  // dbOptions: GetDbConfig(CONST),
});

export default startConfig;
