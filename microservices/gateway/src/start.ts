import { microserviceOptions, microserviceParams } from '@config/ms';
import { MS_DISABLE_REMOTE_MIDDLEWARE } from '@constants/index';
import { start } from '.';

// Entrypoint for nodejs
void start({
  msOptions: microserviceOptions,
  msParams: microserviceParams,
  isDisableRemoteMiddleware: Boolean(MS_DISABLE_REMOTE_MIDDLEWARE),
});
