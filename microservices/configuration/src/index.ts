import 'reflect-metadata';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import {
  IMiddlewareRepository,
  RemoteMiddlewareServer,
} from '@lomray/microservice-remote-middleware';
import type { ConnectionOptions, Connection } from 'typeorm';
import { createDbConnection } from '@config/db';
import Middleware from '@models/middleware';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  dbOptions: ConnectionOptions;
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
  isDisableRemoteMiddleware = false,
  hooks: { afterDbConnection, afterInitRemoteMiddleware, beforeStart } = {},
}: IStartConfig): Promise<void> => {
  try {
    const microservice = Microservice.create(msOptions, msParams);
    const connection = await createDbConnection(dbOptions);

    await afterDbConnection?.(microservice, connection);

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
    console.info('\x1b[31m%s\x1b[0m', `Failed to start microservice: ${e.message as string}`);
    process.exit(1);
  }
};

export { start };
