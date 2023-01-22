import {
  ILokiTransportOptions,
  Log,
  GetDbConfig,
  GetMsOptions,
  GetMsParams,
  GetMsStartConfig,
} from '@lomray/microservice-helpers';
import { getCustomRepository, In } from 'typeorm';
import CONST from '@constants/index';
import Config from '@entities/config';
import Middleware from '@entities/middleware';
import registerMethods from '@methods/index';
import ConfigRepository from '@repositories/config-repository';
import MiddlewareRepository from '@repositories/middleware-repository';

/**
 * Startup config
 */
const startConfig = GetMsStartConfig(CONST, {
  type: 'microservice',
  registerMethods,
  msOptions: GetMsOptions(CONST),
  msParams: GetMsParams(),
  dbOptions: GetDbConfig(CONST),
  shouldUseDbRemoteOptions: false,
  remoteConfig: { isEnable: false },
  remoteMiddleware: {
    isEnable: CONST.IS_ENABLE_REMOTE_MIDDLEWARE,
    type: 'server',
    getRepository: () => getCustomRepository(MiddlewareRepository),
  },
  hooks: {
    afterCreateMicroservice: async () => {
      const configRepository = getCustomRepository(ConfigRepository);
      const middlewareRepository = getCustomRepository(MiddlewareRepository);

      const [configExist, middlewareExist] = await Promise.all([
        configRepository.count(),
        middlewareRepository.count(),
      ]);

      if (!configExist) {
        await configRepository.bulkSave(JSON.parse(CONST.MS_INIT_CONFIGS) as Partial<Config>[]);
      }

      if (!middlewareExist) {
        await middlewareRepository.bulkSave(
          JSON.parse(CONST.MS_INIT_MIDDLEWARES) as Partial<Middleware>[],
        );
      }

      if (CONST.MS_GRAFANA_LOKI_CONFIG) {
        const grafanaLokiConfig = await configRepository.findOne({
          where: { type: 'grafana-loki', microservice: In([CONST.MS_NAME, '*']) },
        });

        if (grafanaLokiConfig) {
          Log.enableLokiTransport(grafanaLokiConfig.params as ILokiTransportOptions);
        }
      }
    },
  },
});

export default startConfig;
