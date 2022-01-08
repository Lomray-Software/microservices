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
import Middleware from '@entities/middleware';
import ConfigRepository from '@repositories/config-repository';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  dbOptions: ConnectionOptions;
  registerMethods?: (ms: Microservice) => Promise<void> | void;
  initConfigs?: Record<string, any>[];
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

    await configRepository.bulkSave(initConfigs);
    await afterDbConnection?.(microservice, connection);
    await registerMethods?.(microservice);

    // Enable remote middleware
    if (!isDisableRemoteMiddleware) {
      const middlewareRepository = connection.getRepository(Middleware) as IMiddlewareRepository;
      const remoteMiddleware = RemoteMiddlewareServer.create(microservice, middlewareRepository);

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
