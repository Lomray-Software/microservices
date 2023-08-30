import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  // @TODO add microservice methods below
  // ms.addEndpoint('demo.endpoint', DemoHandler, { isDisableMiddlewares: true, isPrivate: true });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
