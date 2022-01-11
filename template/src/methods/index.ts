import type { Microservice } from '@lomray/microservice-nodejs-lib';
import MetaEndpoint from '@methods/meta';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  // @TODO add microservice methods below
  // ms.addEndpoint('demo.endpoint', DemoHandler, { isDisableMiddlewares: true, isPrivate: true });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint, { isDisableMiddlewares: true, isPrivate: true });
};
