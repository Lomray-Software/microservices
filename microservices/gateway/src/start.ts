import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_DISABLE_REMOTE_MIDDLEWARE } from '@constants/index';
// eslint-disable-next-line unicorn/import-index
import { start } from './index';

// Entrypoint for nodejs
void start({
  msOptions: microserviceOptions,
  msParams: microserviceParams,
  isDisableRemoteMiddleware: Boolean(MS_DISABLE_REMOTE_MIDDLEWARE),
});
