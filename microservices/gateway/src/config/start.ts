import { GetMsStartConfig } from '@lomray/microservice-helpers';
import { msOptions, msParams } from '@config/ms';
import CONST from '@constants/index';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'gateway',
  msOptions,
  msParams,
});

export default startConfig;
