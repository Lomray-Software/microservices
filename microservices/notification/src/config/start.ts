import { GetMsStartConfig } from '@lomray/microservice-helpers';
import CONST from '@constants/index';
import registerJobs from '@jobs/index';
import registerMethods from '@methods/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
  registerJobs,
});

export default startConfig;
