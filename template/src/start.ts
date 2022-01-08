import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_DISABLE_REMOTE_MIDDLEWARE } from '@constants/index';
import registerMethods from '@methods/index';
// eslint-disable-next-line unicorn/import-index
import { start } from './index';

// Entrypoint for nodejs
export default start({
  msOptions: microserviceOptions,
  msParams: microserviceParams,
  registerMethods,
  isDisableRemoteMiddleware: Boolean(MS_DISABLE_REMOTE_MIDDLEWARE),
});
