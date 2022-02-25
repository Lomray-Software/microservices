import { start } from '@lomray/microservice-helpers';
import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_ENABLE_REMOTE_MIDDLEWARE } from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default start({
  msOptions: microserviceOptions,
  msParams: microserviceParams,
  registerMethods,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
