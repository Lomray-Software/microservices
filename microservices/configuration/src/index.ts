import { startWithDb } from '@lomray/microservice-helpers';
import { getCustomRepository } from 'typeorm';
import dbOptions from '@config/db';
import { msOptions, msParams } from '@config/ms';
import {
  MS_INIT_CONFIGS,
  MS_ENABLE_REMOTE_MIDDLEWARE,
  MS_INIT_MIDDLEWARES,
} from '@constants/index';
import registerMethods from '@methods/index';
import ConfigRepository from '@repositories/config-repository';
import MiddlewareRepository from '@repositories/middleware-repository';

/**
 * Entrypoint for nodejs (run microservice)
 */
export default startWithDb({
  type: 'microservice',
  msOptions,
  msParams,
  dbOptions,
  registerMethods,
  shouldUseDbRemoteOptions: false,
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
        await configRepository.bulkSave(JSON.parse(MS_INIT_CONFIGS));
      }

      if (!middlewareExist) {
        await middlewareRepository.bulkSave(JSON.parse(MS_INIT_MIDDLEWARES));
      }
    },
  },
});
