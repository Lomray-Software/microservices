import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import Endpoint from '@methods/index';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  isDisableRemoteMiddleware?: boolean;
  hooks?: {
    afterCreateMicroservice?: (ms: Microservice) => Promise<void> | void;
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
  isDisableRemoteMiddleware = false,
  hooks: { afterCreateMicroservice, afterInitRemoteMiddleware, beforeStart } = {},
}: IStartConfig): Promise<void> => {
  try {
    const microservice = Microservice.create(msOptions, msParams);

    microservice.addEndpoint(Endpoint.endpoint, Endpoint.handler);

    await afterCreateMicroservice?.(microservice);

    // Enable remote middleware
    if (!isDisableRemoteMiddleware) {
      const remoteMiddleware = RemoteMiddlewareClient.create(microservice);

      await afterInitRemoteMiddleware?.(remoteMiddleware);
      await remoteMiddleware.addRegisterEndpoint().obtainMiddlewares();
    }

    await beforeStart?.();
    await microservice.start();
  } catch (e) {
    console.info('\x1b[31m%s\x1b[0m', `Failed to start microservice: ${e.message as string}`);
    process.exit(1);
  }
};

export { start };
