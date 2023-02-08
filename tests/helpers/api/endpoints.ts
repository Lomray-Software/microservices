import type ApiClientDefault from '@lomray/microservices-client-api/api-client';
import EndpointsDefault from '@lomray/microservices-client-api/endpoints';
import ApiClient from '@helpers/api/client';
import type { IApiClientReqOptions as IApiReqOpt } from '@helpers/api/client';

declare module '@lomray/microservices-client-api/api-client' {
  export interface IApiClientReqOptions extends Pick<IApiReqOpt, 'authToken' | 'isDirectReq'> {}
}

/**
 * API endpoints
 */
class Endpoints extends EndpointsDefault<Endpoints> {
  /**
   * Create client
   */
  static create(client?: ApiClient): Endpoints {
    return new this((client ?? new ApiClient()) as unknown as ApiClientDefault);
  }
}

export default Endpoints;
