import { Log } from '@lomray/microservice-helpers';
import type { IMicroserviceOptions, IMicroserviceParams } from '@lomray/microservice-nodejs-lib';
import { Microservice } from '@lomray/microservice-nodejs-lib';
import { RemoteMiddlewareClient } from '@lomray/microservice-remote-middleware';
import { IS_TEST, MS_CONFIG_NAME } from '@constants/index';

export interface IStartConfig {
  msOptions: Partial<IMicroserviceOptions>;
  msParams: Partial<IMicroserviceParams>;
  registerMethods?: (ms: Microservice) => Promise<void> | void;
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

    await registerMethods?.(microservice);
    await afterCreateMicroservice?.(microservice);

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
