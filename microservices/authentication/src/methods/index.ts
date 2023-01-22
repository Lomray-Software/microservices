import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CookiesRemove from '@methods/cookies/remove';
import TokenCreate from '@methods/token/create';
import TokenIdentify from '@methods/token/identify';
import TokenList from '@methods/token/list';
import TokenRemove from '@methods/token/remove';
import TokenRenew from '@methods/token/renew';
import TokenUpdate from '@methods/token/update';
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
  ms.addEndpoint('token.update', TokenUpdate);

  /**
   * Cookies methods
   */
  ms.addEndpoint('cookies.remove', CookiesRemove);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
