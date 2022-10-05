import { ILokiTransportOptions, IStartConfigWithDb, Log } from '@lomray/microservice-helpers';
import { getCustomRepository, In } from 'typeorm';
import dbOptions from '@config/db';
import { msOptions, msParams } from '@config/ms';
import {
  MS_CONSOLE_LOG_LEVEL,
  MS_ENABLE_GRAFANA_LOKI_LOG,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_INIT_CONFIGS,
  MS_INIT_MIDDLEWARES,
} from '@constants/index';
import Config from '@entities/config';
import Middleware from '@entities/middleware';
import registerMethods from '@methods/index';
import ConfigRepository from '@repositories/config-repository';
import MiddlewareRepository from '@repositories/middleware-repository';

const startConfig: IStartConfigWithDb = {
  type: 'microservice',
  msOptions,
  msParams,
  dbOptions: dbOptions(),
  registerMethods,
  shouldUseDbRemoteOptions: false,
  logConsoleLevel: MS_CONSOLE_LOG_LEVEL,
  remoteMiddleware: {
    isEnable: Boolean(MS_ENABLE_REMOTE_MIDDLEWARE),
    type: 'server',
    getRepository: () => getCustomRepository(MiddlewareRepository),
  },
  remoteConfig: { isEnable: false },
  hooks: {
    afterCreateMicroservice: async () => {
      const configRepository = getCustomRepository(ConfigRepository);
      const middlewareRepository = getCustomRepository(MiddlewareRepository);

      const [configExist, middlewareExist] = await Promise.all([
        configRepository.count(),
        middlewareRepository.count(),
      ]);

      if (!configExist) {
        await configRepository.bulkSave(JSON.parse(MS_INIT_CONFIGS) as Partial<Config>[]);
      }

      if (!middlewareExist) {
        await middlewareRepository.bulkSave(
          JSON.parse(MS_INIT_MIDDLEWARES) as Partial<Middleware>[],
        );
      }

      if (MS_ENABLE_GRAFANA_LOKI_LOG) {
        const grafanaLokiConfig = await configRepository.findOne({
          where: { type: 'grafana-loki', microservice: In([msOptions.name, '*']) },
        });

        if (grafanaLokiConfig) {
          Log.enableLokiTransport(grafanaLokiConfig.params as ILokiTransportOptions);
        }
      }
    },
  },
};

export default startConfig;
