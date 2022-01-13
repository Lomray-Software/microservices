import { Log } from '@lomray/microservice-helpers';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import {
  IMiddlewareRepository,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import type { ConnectionOptions, Connection } from 'typeorm';
import { createDbConnection } from '@config/db';
import { IS_TEST } from '@constants/index';
import Config from '@entities/config';
import Middleware from '@entities/middleware';
import ConfigRepository from '@repositories/config-repository';
import MiddlewareRepository from '@repositories/middleware-repository';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  dbOptions: ConnectionOptions;
  registerMethods?: (ms: Microservice) => Promise<void> | void;
  initConfigs?: Config[];
  initMiddlewares?: Middleware[];
  isDisableRemoteMiddleware?: boolean;
  hooks?: {
    afterDbConnection?: (ms: Microservice, connection: Connection) => Promise<void> | void;
    afterInitRemoteMiddleware?: (remoteMiddleware: RemoteMiddlewareServer) => Promise<void> | void;
    beforeStart?: () => Promise<void> | void;
  };
}

/**
 * Initialize & start microservice
 */
const start = async ({
  msOptions,
  msParams,
  dbOptions,
  registerMethods,
  initConfigs = [],
  initMiddlewares = [],
  isDisableRemoteMiddleware = false,
  hooks: { afterDbConnection, afterInitRemoteMiddleware, beforeStart } = {},
}: IStartConfig): Promise<void> => {
  try {
    Log.defaultMeta = {
      ...Log.defaultMeta,
      service: msOptions.name,
      msOptions,
      isDisableRemoteMiddleware,
    };

    const microservice = Microservice.create(msOptions, msParams);
    const connection = await createDbConnection(dbOptions);
    const configRepository = connection.getCustomRepository(ConfigRepository);
    const middlewareRepository = connection.getCustomRepository(MiddlewareRepository);

    await configRepository.bulkSave(initConfigs);
    await middlewareRepository.bulkSave(initMiddlewares);
    await afterDbConnection?.(microservice, connection);
    await registerMethods?.(microservice);

    // Enable remote middleware
    if (!isDisableRemoteMiddleware) {
      const remoteMiddleware = RemoteMiddlewareServer.create(
        microservice,
        middlewareRepository as IMiddlewareRepository,
        {
          logDriver: msParams.logDriver,
        },
      );

      await afterInitRemoteMiddleware?.(remoteMiddleware);

      remoteMiddleware.addRegisterEndpoint().addObtainEndpoint();
    }

    await beforeStart?.();
    await microservice.start();
  } catch (e) {
    Log.error('Failed to start microservice:', e);

    if (!IS_TEST) {
      process.exit(1);
    }
  }
};

export { start };
