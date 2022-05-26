import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import { API_GATEWAY, IJSON_CONNECTION } from '@constants/index';

interface IBaseException {
  code: number;
  status: number;
  service: string;
  message: string;
  rawMessage?: string;
  payload?: Record<string, any>;
}

type MSResponse<TResponse> = {
  id?: string;
  result?: TResponse;
  error?: IBaseException | AxiosError;
};

export interface IApiClientReqOptions {
  authToken?: string;
  isDirectReq?: boolean; // send request to ijson directly
  req?: AxiosRequestConfig;
}

/**
 * API client
 */
class Client {
  /**
   * Send request to API
   */
  public async sendRequest<TResponse>(
    method: string,
    params = {},
    options: IApiClientReqOptions = {},
  ): Promise<MSResponse<TResponse>> {
    const { authToken, isDirectReq = false, req = {} } = options;
    const [microservice, ...methodParts] = method.split('.');

    try {
      if (authToken) {
        _.set(req, 'headers.Authorization', `Bearer ${authToken}`);
      }

      if (isDirectReq) {
        _.set(params, 'payload.isInternal', true);
      }

      const { data } = await axios.request<MSResponse<TResponse>>({
        baseURL: isDirectReq ? `${IJSON_CONNECTION}/ms/${microservice}` : API_GATEWAY,
        method: 'POST',
        ...req,
        data: {
          method: isDirectReq ? methodParts.join('.') : method,
          params,
        },
      });

      return data;
    } catch (e) {
      return {
        error: e as AxiosError,
      };
    }
  }
}

export default Client;
