import { start } from '@lomray/microservice-helpers';
import { microserviceOptions, microserviceParams } from '@config/ms';
import {
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_ENABLE_GRAFANA_LOG,
  MS_GRAFANA_LOKI_CONFIG,
} from '@constants/index';
import registerMethods from '@methods/index';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default start({
  type: 'microservice',
  msOptions: microserviceOptions,
  msParams: microserviceParams,
  registerMethods,
  logGrafana: MS_GRAFANA_LOKI_CONFIG || Boolean(MS_ENABLE_GRAFANA_LOG),
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'client',
  },
});
