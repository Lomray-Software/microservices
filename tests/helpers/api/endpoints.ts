import ApiClient from '@helpers/api/client';
import type { IApiClientReqOptions } from '@helpers/api/client';

/**
 * API endpoints
 */
class Endpoints {
  /**
   * API client
   */
  public apiClient: ApiClient;

  /**
   * Create client
   */
  static create(client?: ApiClient): Endpoints {
    return new this(client ?? new ApiClient());
  }

  /**
   * @constructor
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Create endpoint handler
   */
  private createHandler =
    <TInput, TOutput = Record<string, any>>(method: string) =>
    (params?: TInput, options?: IApiClientReqOptions) =>
      this.apiClient.sendRequest<TOutput>(method, params, options);

  /**
   * Authentication microservice
   */
  authentication = {
    token: {
      create: this.createHandler('authentication.token.create'),
      update: this.createHandler('authentication.token.update'),
      renew: this.createHandler('authentication.token.renew'),
    },
    cookies: {
      remove: this.createHandler('authentication.cookies.remove'),
    },
  };

  /**
   * Authorization microservice
   */
  authorization = {
    userRole: {
      assign: this.createHandler('authorization.user-role.assign'),
    },
  };

  /**
   * Users microservice
   */
  users = {
    identityProvider: {
      signIn: this.createHandler('users.identity-provider.sign-in'),
    },
    user: {
      me: this.createHandler('users.user.me'),
      list: this.createHandler('users.user.list'),
      view: this.createHandler('users.user.view'),
      update: this.createHandler('users.user.update'),
      signOut: this.createHandler('users.user.sign-out'),
      signUp: this.createHandler('users.user.sign-up'),
      signIn: this.createHandler('users.user.sign-in'),
      changeLogin: this.createHandler('users.user.change-login'),
      changePassword: this.createHandler('users.user.change-password'),
      create: this.createHandler('users.user.create'),
    },
    profile: {
      update: this.createHandler('users.profile.update'),
      view: this.createHandler('users.profile.view'),
    },
    confirmCode: {
      send: this.createHandler('users.confirm-code.send'),
    },
  };
}

export default Endpoints;
