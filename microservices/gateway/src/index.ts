import { start } from '@lomray/microservice-helpers';
import { msOptions, msParams } from '@config/ms';
import { MS_ENABLE_REMOTE_MIDDLEWARE } from '@constants/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default start({
  type: 'gateway',
  msOptions,
  msParams,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
