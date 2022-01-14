import type { Microservice } from '@lomray/microservice-nodejs-lib';
import MetaEndpoint from '@methods/meta';
import TokenCreate from '@methods/token/create';
import TokenIdentify from '@methods/token/identify';
import TokenList from '@methods/token/list';
import TokenRemove from '@methods/token/remove';
import TokenRenew from '@methods/token/renew';
import TokenView from '@methods/token/view';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  /**
   * Token methods
   */
  ms.addEndpoint('token.create', TokenCreate, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('token.renew', TokenRenew, { isDisableMiddlewares: true });
  ms.addEndpoint('token.identify', TokenIdentify, { isDisableMiddlewares: true });
  ms.addEndpoint('token.list', TokenList, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('token.view', TokenView, { isDisableMiddlewares: true, isPrivate: true });
  ms.addEndpoint('token.remove', TokenRemove, { isDisableMiddlewares: true, isPrivate: true });

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint, { isDisableMiddlewares: true, isPrivate: true });
};
