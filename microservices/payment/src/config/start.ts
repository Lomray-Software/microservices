import { GetMsStartConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
});

export default startConfig;
