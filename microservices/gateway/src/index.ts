import { Log } from '@lomray/microservice-helpers';
import type { IGatewayOptions, IGatewayParams } from '@lomray/microservice-nodejs-lib';
import { Gateway } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import { IS_TEST } from '@constants/index';

export interface IStartConfig {
  msOptions: Partial<IGatewayOptions>;
  msParams: Partial<IGatewayParams>;
  registerMethods?: (ms: Gateway) => Promise<void> | void;
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

    const microservice = Gateway.create(msOptions, msParams);

    await registerMethods?.(microservice);
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
    Log.error('Failed to start microservice:', e);

    if (!IS_TEST) {
      process.exit(1);
    }
  }
};

export { start };
