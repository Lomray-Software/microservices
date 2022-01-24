import { Log, RemoteConfig } from '@lomray/microservice-helpers';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import { Connection, ConnectionOptions } from 'typeorm';
import { createDbConnection } from '@config/db';
import { IS_TEST, MS_CONFIG_NAME } from '@constants/index';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  dbOptions: ConnectionOptions;
  dbOptionsObtain?: boolean | number;
  registerMethods?: (ms: Microservice) => Promise<void> | void;
  isDisableRemoteMiddleware?: boolean;
  hooks?: {
    afterCreateMicroservice?: (ms: Microservice, connection: Connection) => Promise<void> | void;
    afterInitRemoteMiddleware?: (remoteMiddleware: RemoteMiddlewareClient) => Promise<void> | void;
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
  dbOptionsObtain,
  registerMethods,
  isDisableRemoteMiddleware = false,
  hooks: { afterCreateMicroservice, afterInitRemoteMiddleware, beforeStart } = {},
}: IStartConfig): Promise<void> => {
  try {
    Log.defaultMeta = {
      ...Log.defaultMeta,
      service: msOptions.name,
      msOptions,
      isDisableRemoteMiddleware,
    };

    const microservice = Microservice.create(msOptions, msParams);

    RemoteConfig.create(microservice, {
      msName: msOptions.name as string,
      msConfigName: MS_CONFIG_NAME,
    });

    let dbOptionsResult = {};

    if (dbOptionsObtain) {
      dbOptionsResult = await RemoteConfig.get<ConnectionOptions>('db', { isThrowNotExist: true });
    }

    const connection = await createDbConnection({ ...dbOptions, ...dbOptionsResult });

    await afterCreateMicroservice?.(microservice, connection);
    await registerMethods?.(microservice);

    // Enable remote middleware
    if (!isDisableRemoteMiddleware) {
      const remoteMiddleware = RemoteMiddlewareClient.create(microservice, {
        logDriver: msParams.logDriver,
        configurationMsName: MS_CONFIG_NAME,
      });

      await afterInitRemoteMiddleware?.(remoteMiddleware);
      await remoteMiddleware.addRegisterEndpoint().obtainMiddlewares();
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
