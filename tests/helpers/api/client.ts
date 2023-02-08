// noinspection JSUnusedGlobalSymbols

import type { TReqData } from '@lomray/microservices-client-api/api-client';
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
  request?: AxiosRequestConfig;
}

/**
 * API client
 */
class Client {
  /**
   * Get client language
   */
  public getLanguage() {
    return undefined;
  }

  /**
   * Send request to API
   */
  public async sendRequest<TResponse, TRequest>(
    reqData: TReqData<TRequest>,
    options: IApiClientReqOptions = {},
  ): Promise<MSResponse<TResponse>> {
    const { authToken, isDirectReq = false, request = {} } = options;
    const { method, params = {} } = Array.isArray(reqData) ? reqData[0] : reqData;
    const [microservice, ...methodParts] = method.split('.');

    try {
      if (authToken) {
        _.set(request, 'headers.Authorization', `Bearer ${authToken}`);
      }

      if (isDirectReq) {
        _.set(params, 'payload.isInternal', true);
      }

      const { data } = await axios.request<MSResponse<TResponse>>({
        baseURL: isDirectReq ? `${IJSON_CONNECTION}/ms/${microservice}` : API_GATEWAY,
        method: 'POST',
        ...request,
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
