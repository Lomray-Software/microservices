import { startWithDb } from '@lomray/microservice-helpers';
import dbOptions from '@config/db';
import { msOptions, msParams } from '@config/ms';
import { DB_FROM_CONFIG_MS, MS_ENABLE_REMOTE_MIDDLEWARE } from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default startWithDb({
  type: 'microservice',
  msOptions,
  msParams,
  dbOptions,
  registerMethods,
  // for local run without configuration ms this should be set to false (or use RunConfiguration IDE)
  shouldUseDbRemoteOptions: Boolean(DB_FROM_CONFIG_MS),
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
