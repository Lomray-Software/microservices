import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import { Gateway } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';

export interface IStartConfig {
  msOptions: Partial<IGatewayOptions>;
  msParams: Partial<IGatewayParams>;
  isDisableRemoteMiddleware?: boolean;
  hooks?: {
    afterCreateMicroservice?: (ms: Gateway) => Promise<void> | void;
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
    const microservice = Gateway.create(msOptions, msParams);

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
